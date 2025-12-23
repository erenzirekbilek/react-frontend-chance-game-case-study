import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Container, Card, Table, Button, Badge, Form, Alert, Nav, Tab, Row, Col, Spinner } from 'react-bootstrap';

const API_BASE = 'http://127.0.0.1:8000/api/games';

function GamePanel() {
  const username = localStorage.getItem('username') || 'Oyuncu';
  const token = localStorage.getItem('token');
  const userId = parseInt(localStorage.getItem('user_id'), 10) || null;

  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [betLevels, setBetLevels] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', max_players: 2, bet_level: '' });
  const [coin, setCoin] = useState(Number(localStorage.getItem('coin')) || 0);
  const [guessInput, setGuessInput] = useState('');
  const [secretNumber, setSecretNumber] = useState(null);

  // GAME STATE
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePlayers, setGamePlayers] = useState({});
  const [currentTurn, setCurrentTurn] = useState(null);
  const [currentTurnUsername, setCurrentTurnUsername] = useState('');
  const [gameMessages, setGameMessages] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const ws = useRef(null);
  const roomRefreshInterval = useRef(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // ===== Fetch Rooms & Bet Levels =====
  const fetchData = async () => {
    try {
      const [userRes, betRes, roomRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/users/me/', getAuthConfig()),
        axios.get(`${API_BASE}/bet-levels/`, getAuthConfig()),
        axios.get(`${API_BASE}/rooms/`, getAuthConfig())
      ]);

      setUser(userRes.data);
      localStorage.setItem('user_id', userRes.data.id);

      const userCoin = userRes.data.coin || userRes.data.balance || 0;
      setCoin(userCoin);
      localStorage.setItem('coin', userCoin);

      setBetLevels(betRes.data || []);
      setRooms(roomRes.data || []);
    } catch (err) {
      console.error('❌ FETCH HATASI:', err.message);
      setRooms([]);
      setBetLevels([]);
    }
  };

  useEffect(() => {
    fetchData();
    roomRefreshInterval.current = setInterval(fetchData, 3000);
    
    return () => {
      if (roomRefreshInterval.current) clearInterval(roomRefreshInterval.current);
    };
  }, []);

  useEffect(() => {
    if (user && rooms) {
      const my = rooms.filter(r => r.creator?.id === user.id);
      setMyRooms(my);
    }
  }, [rooms, user]);

  // ===== WebSocket Connection =====
  useEffect(() => {
    if (!selectedRoom || !userId || !token) {
      return;
    }

    const connectWebSocket = () => {
      const wsUrl = `ws://127.0.0.1:8000/ws/game/${selectedRoom.id}/?token=${token}`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setWsConnected(true);
        addGameMessage('Oyun odasına bağlandınız!', 'system');
        console.log("WebSocket bağlantısı açıldı");
      };

      ws.current.onmessage = e => {
        try {
          const data = JSON.parse(e.data);

          switch(data.type) {
            case 'player_joined':
              addGameMessage(`👤 ${data.username} odaya girdi`, 'system');
              setGamePlayers(data.players || {});
              setGameOver(false);
              setWinner(null);
              break;

            case 'game_start':
              setGameStarted(true);
              setGamePlayers(data.players);
              setCurrentTurn(data.turn);
              setCurrentTurnUsername(data.turn_username);
              setSecretNumber(data.secret);
              setGameOver(false);
              setWinner(null);
              setGameMessages([{ msg: `🎮 Oyun başladı! Gizli sayı: ${data.secret} (1-100)`, type: 'system', time: new Date().toLocaleTimeString() }]);
              break;

            case 'guess_result':
              if (data.correct) {
                addGameMessage(`✅ ${data.username} DOĞRU! Gizli sayı: ${data.secret}`, 'correct');
              } else {
                const hintText = data.hint === 'higher' ? '⬆️ YUKARIDA' : '⬇️ AŞAĞIDA';
                addGameMessage(`❌ ${data.username}: ${data.guess} → ${hintText}`, 'wrong');
                addGameMessage(`➡️ Sıra ${data.next_turn_username}'ye geçti`, 'system');
              }
              setCurrentTurn(data.next_turn);
              setCurrentTurnUsername(data.next_turn_username);
              break;

            case 'game_over':
              setGameOver(true);
              setWinner(data.winner_username);
              addGameMessage(`🏆 ${data.winner_username} kazandı! Ödül: +${data.prize} 💰`, 'winner');

              if (userId === data.winner_id) {
                const newCoin = coin + data.prize;
                setCoin(newCoin);
                localStorage.setItem('coin', newCoin);
              }
              
              setTimeout(() => {
                ws.current?.close();
                setSelectedRoom(null);
                setGameStarted(false);
                setGameMessages([]);
                setGameOver(false);
                setWinner(null);
                setSecretNumber(null);
                setGamePlayers({});
                setWsConnected(false);
                fetchData();
              }, 500);
              break;

            case 'player_disconnected':
              addGameMessage(`❌ ${data.username} ayrıldı!`, 'error');
              if (!gameStarted) {
                setTimeout(() => {
                  alert('Rakip oyuncu ayrıldı! Odadan çıkılıyor...');
                  ws.current?.close();
                  setSelectedRoom(null);
                  setGameMessages([]);
                  setWsConnected(false);
                  fetchData();
                }, 1000);
              }
              break;

            case 'error':
              addGameMessage(`❌ ${data.message}`, 'error');
              break;

            default:
              console.log('⚠️ Bilinmeyen mesaj:', data.type);
          }
        } catch (e) {
          console.error('❌ Mesaj parse hatası:', e);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket hatası:', error);
        setWsConnected(false);
        addGameMessage('Bağlantı hatası!', 'error');
      };

      ws.current.onclose = () => {
        setWsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [selectedRoom, userId, token, coin, gameStarted]);

  // ===== Helpers =====
  const addGameMessage = (msg, type = 'system') => {
    setGameMessages(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const makeGuess = () => {
    if (!ws.current || !gameStarted || currentTurn !== userId) {
      return;
    }

    const guessNum = parseInt(guessInput, 10);
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      alert('1-100 arası sayı girin!');
      return;
    }

    ws.current.send(JSON.stringify({
      type: 'guess',
      guess: guessNum,
      user_id: userId
    }));
    setGuessInput('');
  };

  // ===== Create Room =====
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.bet_level) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/rooms/`, {
        name: form.name,
        max_players: Number(form.max_players),
        bet_level_id: Number(form.bet_level)
      }, getAuthConfig());
      
      setRooms(prev => [...prev, res.data]);
      setForm({ name: '', max_players: 2, bet_level: '' });
      alert('Oda başarıyla oluşturuldu! ✅');
    } catch (err) {
      alert('Oda oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete Room =====
  const handleDelete = async id => {
    if (!window.confirm('Odayı silmek istediğinize emin misiniz?')) return;

    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/rooms/${id}/`, getAuthConfig());
      setRooms(prev => prev.filter(r => r.id !== id));
      alert('Oda silindi! ✅');
    } catch (err) {
      alert('Oda silinirken hata oluştu!');
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  // ===== Join Room =====
  const handleJoinRoom = async roomId => {
    const id = parseInt(roomId, 10);

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/rooms/${id}/join/`, {}, getAuthConfig());
      const room = rooms.find(r => r.id === id);

      if (room) {
        setSelectedRoom(room);
        setGameStarted(false);
        setGameMessages([]);
        setGameOver(false);
        setCurrentTurn(null);
        setWsConnected(false);
        addGameMessage(`👤 ${username} odaya katıldı`, 'system');
      }
    } catch (err) {
      alert(`Hata: ${err.response?.data?.error || 'Odaya katılırken hata oluştu!'}`);
      fetchData();
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 🎮 GAME SCREEN
  // =====================================================
  if (selectedRoom && gameStarted) {
    const isMyTurn = currentTurn === userId;

    return (
      <Container className="mt-5">
        <Row>
          <Col md={8}>
            <Card bg="dark" text="light" className="p-4 shadow-lg">
              <h2 className="mb-4">🎮 {selectedRoom.name}</h2>

              <Card bg="secondary" text="white" className="p-3 mb-4">
                <Row>
                  <Col><strong>💰 Bakiye:</strong> {coin}</Col>
                  <Col><strong>🎯 Gizli Sayı:</strong> {secretNumber || '?'}</Col>
                </Row>
                {gamePlayers && Object.entries(gamePlayers).map(([id, name]) => (
                  <div key={id} style={{ marginLeft: '20px', color: parseInt(id) === userId ? '#00ff00' : '#fff' }}>
                    {parseInt(id) === userId ? '👉 ' : '   '} {name} {parseInt(id) === userId ? '(SİZ)' : ''}
                  </div>
                ))}
                <div style={{ marginTop: '10px' }}>🔗 WS: {wsConnected ? '✅' : '❌'}</div>
              </Card>

              <div style={{ height: '250px', overflowY: 'auto', background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #444' }}>
                {gameMessages.map((m, i) => (
                  <div key={i} style={{
                    marginBottom: '8px',
                    color: m.type === 'correct' ? '#00ff00' : m.type === 'wrong' ? '#ff6b6b' : m.type === 'winner' ? '#ffd700' : '#aaa',
                    fontSize: '0.95rem'
                  }}>
                    <small>[{m.time}]</small> {m.msg}
                  </div>
                ))}
              </div>

              {gameOver && (
                <Alert variant="success" className="text-center">
                  <h4>🏆 OYUN BİTTİ!</h4>
                  <p>{winner === username ? 'Siz kazandınız! 🎉' : `${winner} kazandı!`}</p>
                </Alert>
              )}

              {!gameOver && (
                <div className="text-center">
                  {isMyTurn ? (
                    <>
                      <h5 className="text-warning mb-3">🎯 Sırası Sizin! 1-100 arası tahmin yapın:</h5>
                      <div className="d-flex gap-2 justify-content-center mb-3">
                        <Form.Control 
                          type="number" 
                          min="1" 
                          max="100"
                          placeholder="Sayı girin..." 
                          value={guessInput}
                          onChange={e => setGuessInput(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && makeGuess()}
                        />
                        <Button variant="primary" onClick={makeGuess}>Tahmin Et</Button>
                      </div>
                    </>
                  ) : (
                    <h5 className="text-muted">⏳ Sıra {currentTurnUsername || 'bilinmiyor'}'de...</h5>
                  )}
                </div>
              )}

              <Button variant="outline-danger" className="mt-4 w-100" onClick={() => {
                ws.current?.close();
                setSelectedRoom(null);
                setGameStarted(false);
                setGameMessages([]);
                setGameOver(false);
                setWinner(null);
                setSecretNumber(null);
                setGamePlayers({});
                setCurrentTurn(null);
                setCurrentTurnUsername('');
                setGuessInput('');
                setWsConnected(false);
                fetchData();
              }}>Oyundan Çık</Button>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // =====================================================
  // WAITING ROOM SCREEN
  // =====================================================
  if (selectedRoom) {
    return (
      <Container className="mt-5">
        <Card bg="dark" text="light" className="p-4 text-center">
          <h3>⏳ Oyun Başlanmasını Bekleniyor...</h3>
          <p>Başka bir oyuncu katılana kadar bekleyin</p>
          <Badge bg="info" className="mb-3">Oyuncu: {Object.keys(gamePlayers).length} / 2</Badge>
          <p>🔗 WS: {wsConnected ? '✅ Bağlı' : '❌ Bağlanmaya çalışıyor'}</p>
          <Button variant="outline-danger" onClick={() => { 
            ws.current?.close(); 
            setSelectedRoom(null);
            setGameStarted(false);
            setGameMessages([]);
            setGameOver(false);
            setWinner(null);
            setSecretNumber(null);
            setGamePlayers({});
            setCurrentTurn(null);
            setCurrentTurnUsername('');
            setGuessInput('');
            setWsConnected(false);
            fetchData();
          }}>Vazgeç</Button>
        </Card>
      </Container>
    );
  }

  // =====================================================
  // ROOM LIST SCREEN
  // =====================================================
  return (
    <Container className="mt-4">
      <Tab.Container defaultActiveKey="all-rooms">
        <Card bg="dark" text="white" className="p-3 mb-4">
          <h3>🎰 Chance Game - {username}</h3>
          <Badge bg="success">💰 {coin}</Badge>
        </Card>

        <Nav variant="tabs" className="mb-4">
          <Nav.Item><Nav.Link eventKey="all-rooms">🎯 Tüm Odalar</Nav.Link></Nav.Item>
          <Nav.Item><Nav.Link eventKey="my-rooms">📝 Benim Odalarım</Nav.Link></Nav.Item>
        </Nav>

        <Tab.Content>
          {/* ALL ROOMS */}
          <Tab.Pane eventKey="all-rooms">
            <Card bg="dark" className="p-4 mb-4 text-light">
              <h5>Yeni Oda Oluştur</h5>
              <Form onSubmit={handleSubmit} className="d-flex gap-2">
                <Form.Control placeholder="Oda Adı" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required disabled={loading} />
                <Form.Control type="number" min="2" value={form.max_players} onChange={e => setForm({ ...form, max_players: Number(e.target.value) })} disabled={loading} />
                <Form.Select value={form.bet_level} onChange={e => setForm({ ...form, bet_level: e.target.value })} required disabled={loading}>
                  <option value="">Bahis</option>
                  {betLevels.map(b => <option key={b.id} value={b.id}>{b.level_name}</option>)}
                </Form.Select>
                <Button type="submit" variant="success" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Oluştur'}</Button>
              </Form>
            </Card>

            {rooms.length === 0 ? (
              <Alert variant="info">Henüz oda yok</Alert>
            ) : (
              <Card bg="dark" className="text-light">
                <Table variant="dark" hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Oda</th>
                      <th>Sahip</th>
                      <th>Bahis</th>
                      <th>Oyuncu</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <tr key={room.id}>
                        <td>{room.name}</td>
                        <td>{room.creator?.username || '-'}</td>
                        <td><Badge bg="warning" text="dark">{room.bet_level?.level_name || '-'}</Badge></td>
                        <td>{room.users?.length || 0}/2</td>
                        <td>
                          <Button 
                            size="sm" 
                            disabled={(room.users?.length || 0) >= 2 || loading} 
                            onClick={() => {
                              if (room.creator?.id === user?.id) setSelectedRoom(room);
                              else handleJoinRoom(room.id);
                            }}
                          >
                            {room.creator?.id === user?.id ? 'Aç' : 'Katıl'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            )}
          </Tab.Pane>

          {/* MY ROOMS */}
          <Tab.Pane eventKey="my-rooms">
            {myRooms.length === 0 ? (
              <Alert variant="info">Henüz oda oluşturmadınız</Alert>
            ) : (
              <Card bg="dark" className="text-light">
                <Table variant="dark" hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Oda</th>
                      <th>Bahis</th>
                      <th>Oyuncu</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRooms.map(room => (
                      <tr key={room.id}>
                        <td>{room.name}</td>
                        <td><Badge bg="warning" text="dark">{room.bet_level?.level_name || '-'}</Badge></td>
                        <td>{room.users?.length || 0}/2</td>
                        <td>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(room.id)} disabled={loading}>
                            {loading ? <Spinner size="sm" /> : 'Sil'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
}

export default GamePanel;