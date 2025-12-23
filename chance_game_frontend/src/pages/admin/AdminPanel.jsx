import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Button, Form, Tabs, Tab, Modal } from 'react-bootstrap';
import AdminNavbar from '../../components/layout/admin/AdminNavbar';

function AdminPanel() {
  const [key, setKey] = useState('summary');
  const [stats, setStats] = useState({ totalUsers: 0, activeGames: 0, totalCoins: 0 });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newCoin, setNewCoin] = useState(0);

  const USER_API = 'http://127.0.0.1:8000/api/users';

  // 1. TOKEN ALMA FONKSİYONU (Her zaman güncel localStorage'dan çeker)
  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}` // Django SimpleJWT 'Bearer ' ön ekini şart koşar
      }
    };
  };

  // 2. VERİ ÇEKME (Config parametresini her isteğe ekledik)
  const fetchAllData = useCallback(async () => {
    try {
      const config = getAuthConfig();
      
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${USER_API}/stats/`, config),
        axios.get(`${USER_API}/list/`, config)
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("AdminPanel Veri Hatası:", err.response?.status);
      if (err.response?.status === 403) {
          // Token var ama yetki yoksa veya token geçersizse buraya düşer
          console.error("Yetki hatası: Lütfen çıkış yapıp tekrar admin olarak girin.");
      }
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Bakiye Düzenleme Modalını Aç
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewCoin(user.coin);
    setShowEditModal(true);
  };

  // 3. BAKİYE GÜNCELLEME (Buraya da Config ekledik)
  const handleSaveCoin = async () => {
    try {
      await axios.patch(
        `${USER_API}/user-detail/${selectedUser.id}/`, 
        { coin: newCoin }, 
        getAuthConfig() 
      );
      setShowEditModal(false);
      fetchAllData(); // Tabloyu yenile
    } catch (err) {
      alert("Bakiye güncellenemedi. Yetkinizi kontrol edin.");
    }
  };

  return (
    <div className="d-flex">
      <AdminNavbar />
      <div style={{ marginLeft: '250px', width: '100%', padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container fluid>
          <h2 className="mb-4 text-dark fw-bold">Yönetim Paneli</h2>

          <Tabs activeKey={key} onSelect={setKey} className="mb-4">
            <Tab eventKey="summary" title="Genel Özet">
              <Row className="g-4 text-center">
                <Col md={4}><Card className="bg-primary text-white p-3 border-0 shadow-sm"><h5>TOPLAM KULLANICI</h5><h1>{stats.totalUsers}</h1></Card></Col>
                <Col md={4}><Card className="bg-success text-white p-3 border-0 shadow-sm"><h5>AKTİF MASALAR</h5><h1>{stats.activeGames}</h1></Card></Col>
                <Col md={4}><Card className="bg-warning text-dark p-3 border-0 shadow-sm"><h5>SİSTEM COİN</h5><h1>{stats.totalCoins} 🪙</h1></Card></Col>
              </Row>
            </Tab>

            <Tab eventKey="users" title="Kullanıcı Yönetimi">
              <Card className="p-4 border-0 shadow-sm rounded-4">
                <div className="d-flex justify-content-between mb-3">
                  <h5 className="fw-bold">Kullanıcı Listesi</h5>
                  <Form.Control 
                    placeholder="Kullanıcı ara..." 
                    className="w-25" 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                <Table responsive hover>
                  <thead className="table-light">
                    <tr><th>ID</th><th>Kullanıcı</th><th>Email</th><th>Bakiye</th><th>İşlem</th></tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.coin} 🪙</td>
                        <td><Button variant="outline-primary" size="sm" onClick={() => handleEditClick(user)}>Düzenle</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Tab>
          </Tabs>
        </Container>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Bakiye Düzenle: {selectedUser?.username}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Label>Yeni Bakiye Miktarı</Form.Label>
          <Form.Control type="number" value={newCoin} onChange={e => setNewCoin(parseInt(e.target.value) || 0)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>İptal</Button>
          <Button variant="success" onClick={handleSaveCoin}>GÜNCELLE</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminPanel;