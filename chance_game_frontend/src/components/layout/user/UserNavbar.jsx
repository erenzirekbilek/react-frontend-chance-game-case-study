import React from 'react';
import { Navbar, Container, Nav, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function UserNavbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Oyuncu';
  // Bakiyeyi normalde API'den çekeriz, şimdilik statik veya localStorage'dan alalım
  const coin = localStorage.getItem('coin') || '0';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="/dashboard">🎰 Şans Oyunu</Navbar.Brand>
        <Navbar.Toggle aria-controls="user-nav" />
        <Navbar.Collapse id="user-nav">
          <Nav className="me-auto">
            <Nav.Link href="/dashboard">Oyun Odaları</Nav.Link>
            <Nav.Link href="/profile">Profilim</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <Badge bg="warning" text="dark" className="me-3 p-2">
              Bakiye: {coin} 🪙
            </Badge>
            <span className="text-white me-3">Hoş geldin, <b>{username}</b></span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default UserNavbar;