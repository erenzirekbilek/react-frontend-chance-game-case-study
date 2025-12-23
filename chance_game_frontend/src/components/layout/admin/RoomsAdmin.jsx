import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Card } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';

function RoomsAdmin() {
  const [rooms, setRooms] = useState([]);
  const [betLevels, setBetLevels] = useState([]);
  const [form, setForm] = useState({ name: '', max_players: 2, bet_level: '' });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/games/bet-levels/', getAuthConfig())
      .then(res => setBetLevels(res.data))
      .catch(err => console.error('Bet levels yükleme hatası:', err));
    
    axios.get('http://127.0.0.1:8000/api/games/rooms/', getAuthConfig())
      .then(res => setRooms(res.data))
      .catch(err => console.error('Rooms yükleme hatası:', err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'max_players' ? Number(value) : value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.name || !form.bet_level) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const payload = {
        name: form.name,
        max_players: Number(form.max_players),
        bet_level_id: Number(form.bet_level)
      };

      console.log('Gönderilen payload:', payload);

      const res = await axios.post(
        'http://127.0.0.1:8000/api/games/rooms/',
        payload,
        getAuthConfig()
      );

      setRooms([...rooms, res.data]);
      setForm({ name: '', max_players: 2, bet_level: '' });
      alert('Oda başarıyla oluşturuldu! ✅');
    } catch (err) {
      console.error('Backend hatası:', err.response?.data);
      alert(`Hata: ${JSON.stringify(err.response?.data) || 'Oda oluşturulamadı'}`);
    }
  };

  return (
    <div className="d-flex">
      <AdminNavbar />
      <div style={{ marginLeft: '250px', width: '100%', padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container fluid>
          <h2 className="mb-4 text-dark fw-bold">🏠 Oda Yönetimi</h2>

          <Card className="p-4 border-0 shadow-sm rounded-4 mb-4">
            <h5>Yeni Oda Oluştur</h5>
            <Form onSubmit={handleSubmit} className="d-flex gap-2 align-items-end">
              <Form.Control 
                name="name" 
                placeholder="Oda Adı" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
              <Form.Control 
                name="max_players" 
                type="number" 
                min="2"
                placeholder="Max Oyuncu" 
                value={form.max_players} 
                onChange={handleChange} 
                required 
              />
              <Form.Select 
                name="bet_level" 
                value={form.bet_level} 
                onChange={handleChange} 
                required
              >
                <option value="">Bahis Seviyesi Seçin</option>
                {betLevels.map(bl => (
                  <option key={bl.id} value={bl.id}>
                    {bl.level_name}
                  </option>
                ))}
              </Form.Select>
              <Button type="submit" variant="success">Oluştur</Button>
            </Form>
          </Card>

          <h5>Mevcut Odalar</h5>
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Oda Adı</th>
                <th>Max Oyuncu</th>
                <th>Bahis Seviyesi</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length > 0 ? (
                rooms.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.max_players}</td>
                    <td>{r.bet_level?.level_name || '—'}</td>
                    <td>{r.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">Oda bulunamadı</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Container>
      </div>
    </div>
  );
}

export default RoomsAdmin;