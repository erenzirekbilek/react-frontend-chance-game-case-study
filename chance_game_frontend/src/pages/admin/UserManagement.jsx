import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import AdminNavbar from '../../components/layout/admin/AdminNavbar';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newCoin, setNewCoin] = useState(0);

  const USER_API = 'http://127.0.0.1:8000/api/users';
  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${USER_API}/list/`, getAuthHeader());
      setUsers(response.data);
    } catch (error) {
      console.error("Kullanıcı listesi alınamadı", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewCoin(user.coin);
    setShowEditModal(true);
  };

  const handleSaveCoin = async () => {
    try {
      await axios.patch(`${USER_API}/user-detail/${selectedUser.id}/`, { coin: newCoin }, getAuthHeader());
      setShowEditModal(false);
      fetchUsers();
      alert("Bakiye güncellendi! ✅");
    } catch (err) { 
      alert("Bakiye güncellenemedi."); 
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      try {
        await axios.delete(`${USER_API}/user-detail/${userId}/`, getAuthHeader());
        alert("Kullanıcı silindi.");
        fetchUsers();
      } catch (error) {
        alert("Silme işlemi başarısız.");
      }
    }
  };

  return (
    <div className="d-flex">
      <AdminNavbar />
      
      <div style={{ marginLeft: '250px', width: '100%', padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container fluid className="p-4 shadow-sm rounded border bg-white">
          <h2 className="mb-4 fw-bold">Kullanıcı Yönetimi</h2>

          <InputGroup className="mb-4 shadow-sm">
            <Form.Control
              placeholder="Kullanıcı adı veya e-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="primary">🔍 Ara</Button>
          </InputGroup>

          <Table hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Bakiye</th>
                <th className="text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => 
                u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).length > 0 ? (
                users
                  .filter(u => 
                    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td className="fw-bold">{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg="warning" text="dark" className="p-2">{user.coin} 🪙</Badge>
                      </td>
                      <td className="text-center">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(user)}>
                          Düzenle
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                          Sil
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">Kullanıcı bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Container>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bakiye Düzenle: {selectedUser?.username}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Yeni Coin Miktarı</Form.Label>
            <Form.Control 
              type="number" 
              value={newCoin} 
              onChange={(e) => setNewCoin(parseInt(e.target.value) || 0)} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>İptal</Button>
          <Button variant="success" onClick={handleSaveCoin}>GÜNCELLE</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserManagement;