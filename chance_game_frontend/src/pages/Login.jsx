import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/users/login/', {
        username,
        password,
      });

      const data = response.data;
      const token = data.access; // JWT access token
      const role = data.role ? data.role.toLowerCase().trim() : 'user';
      const usernameFromDb = data.username || username;
      const coin = data.coin !== undefined ? data.coin : 0;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', usernameFromDb);
        localStorage.setItem('balance', coin);

        console.log("Giriş Başarılı! Token kaydedildi:", token);

        if (role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login hatası:", err.response?.data);
      setError(err.response?.data?.error || 'Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div className="bg-dark min-vh-100 d-flex align-items-center py-5" style={{ 
      backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' 
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden bg-white">
              <div className="bg-primary" style={{ height: '5px' }}></div>
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">🎰 Chance Game</h2>
                  <p className="text-muted small">Hesabınıza giriş yapın</p>
                </div>

                {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-dark">Kullanıcı Adı</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-light border-0 py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold small text-dark">Şifre</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-light border-0 py-2"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm rounded-pill mb-3">
                    GİRİŞ YAP
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <p className="small mb-0 text-muted">
                    Hesabın yok mu? <br />
                    <Link to="/signup" className="text-primary text-decoration-none fw-bold mt-2 d-inline-block">Hemen Kaydol</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
