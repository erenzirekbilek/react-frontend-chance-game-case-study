import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Form, Card } from 'react-bootstrap';
import AdminNavbar from './AdminNavbar';

function BetLevelsAdmin() {
  const [levels, setLevels] = useState([]);
  const [form, setForm] = useState({ level_name: '', min_bet: 0, max_bet: 100, bet_step: 1, required_balance: 0 });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    axios.get('/api/bet-levels/', getAuthConfig()).then(res => setLevels(res.data));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/bet-levels/', form, getAuthConfig());
      setLevels([...levels, res.data]);
      setForm({ level_name: '', min_bet: 0, max_bet: 100, bet_step: 1, required_balance: 0 });
    } catch (err) {
      alert('Bahis seviyesi oluşturulamadı.');
    }
  };

  return (
    <div className="d-flex">
      <AdminNavbar />
      <div style={{ marginLeft: '250px', width: '100%', padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Container fluid>
          <h2 className="mb-4 text-dark fw-bold">Bahis Seviyeleri Yönetimi</h2>

          <Card className="p-4 border-0 shadow-sm rounded-4 mb-4">
            <h5>Yeni Bahis Seviyesi Oluştur</h5>
            <Form onSubmit={handleSubmit} className="d-flex gap-2 align-items-end flex-wrap">
              <Form.Control name="level_name" placeholder="Seviye Adı" value={form.level_name} onChange={handleChange} required />
              <Form.Control name="min_bet" type="number" placeholder="Min Bahis" value={form.min_bet} onChange={handleChange} required />
              <Form.Control name="max_bet" type="number" placeholder="Max Bahis" value={form.max_bet} onChange={handleChange} required />
              <Form.Control name="bet_step" type="number" placeholder="Bahis Artış" value={form.bet_step} onChange={handleChange} required />
              <Form.Control name="required_balance" type="number" placeholder="Gerekli Bakiye" value={form.required_balance} onChange={handleChange} required />
              <Button type="submit" variant="success">Oluştur</Button>
            </Form>
          </Card>

          <h5>Mevcut Bahis Seviyeleri</h5>
          <Table responsive hover>
            <thead className="table-light">
              <tr><th>ID</th><th>Seviye Adı</th><th>Min Bahis</th><th>Max Bahis</th><th>Adım</th><th>Gerekli Bakiye</th></tr>
            </thead>
            <tbody>
              {levels.map(l => (
                <tr key={l.id}>
                  <td>#{l.id}</td>
                  <td>{l.level_name}</td>
                  <td>{l.min_bet}</td>
                  <td>{l.max_bet}</td>
                  <td>{l.bet_step}</td>
                  <td>{l.required_balance}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </div>
    </div>
  );
}

export default BetLevelsAdmin;
