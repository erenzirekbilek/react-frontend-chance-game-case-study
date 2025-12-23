import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basit bir ön kontrol (Frontend Validation)
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/users/signup/', {
        username,
        email,
        password,
        age: parseInt(age),
      });
      navigate('/login');
    } catch (error) {
      // Django'dan gelen detaylı hata mesajlarını göster (örn: "Bu kullanıcı adı zaten alınmış")
      const serverError = error.response?.data;
      if (serverError) {
        // Eğer backend spesifik bir alan hatası dönerse onu göster, yoksa genel detail mesajını
        const msg = Object.values(serverError).flat().join(' ');
        setError(msg || 'Kayıt başarısız! Lütfen kriterlere uyun.');
      } else {
        setError('Sunucuya bağlanılamadı.');
      }
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Kayıt Ol</h2>
                  <p className="text-muted small">Lütfen bilgileri Django kurallarına uygun giriniz.</p>
                </div>

                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* KULLANICI ADI */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Kullanıcı Adı</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Örn: oyuncu_123" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                      className="bg-light border-0 py-2"
                    />
                    <Form.Text className="text-muted" style={{fontSize: '0.75rem'}}>
                      Harf, rakam ve @/./+/-/_ kullanabilir. Boşluk olamaz.
                    </Form.Text>
                  </Form.Group>

                  {/* EMAIL */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="ornek@mail.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-light border-0 py-2"
                    />
                  </Form.Group>

                  {/* ŞİFRE */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Şifre</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="bg-light border-0 py-2"
                    />
                    <Form.Text className="text-muted" style={{fontSize: '0.75rem'}}>
                      En az 8 karakter, harf ve rakam karışık olması önerilir.
                    </Form.Text>
                  </Form.Group>

                  {/* YAŞ */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Yaş</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)} 
                      required 
                      min="18"
                      className="bg-light border-0 py-2"
                    />
                    <Form.Text className="text-muted" style={{fontSize: '0.75rem'}}>
                      Oyuna katılmak için 18 yaş sınırı vardır.
                    </Form.Text>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm rounded-3">
                    HESAP OLUŞTUR
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="small mb-0 text-muted">Zaten üye misin? <Link to="/login" className="text-primary fw-bold text-decoration-none">Giriş Yap</Link></p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Signup;