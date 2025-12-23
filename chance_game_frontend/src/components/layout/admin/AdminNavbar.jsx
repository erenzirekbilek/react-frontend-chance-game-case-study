import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'bg-primary text-white' : 'text-white';

  return (
    <div className="d-flex flex-column vh-100 p-3 bg-dark text-white shadow" style={{ width: '250px', position: 'fixed', left: 0, top: 0 }}>
      <h4 className="text-center mb-4 text-warning fw-bold">🚀 Admin Panel</h4>
      <hr className="bg-secondary" />
      
      <Nav variant="pills" className="flex-column mb-auto">
        <Nav.Item className="mb-2">
          <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
            📊 Genel Özet
          </Link>
        </Nav.Item>
        
        <Nav.Item className="mb-2">
          <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
            👥 Kullanıcı Yönetimi
          </Link>
        </Nav.Item>
        
        {/* Lobi ve Bahis Ayarları */}
        <Nav.Item className="mb-2">
          <Link to="/admin/settings" className={`nav-link ${isActive('/admin/settings')}`}>
            ⚙️ Lobi ve Bahis Ayarları
          </Link>
        </Nav.Item>

        {/* Yeni: Odalar */}
        <Nav.Item className="mb-2">
          <Link to="/admin/rooms" className={`nav-link ${isActive('/admin/rooms')}`}>
            🏟️ Odalar
          </Link>
        </Nav.Item>
      </Nav>
      
      <div className="mt-auto px-2">
        <hr className="bg-secondary" />
        <Button variant="outline-danger" className="w-100 fw-bold" onClick={handleLogout}>
          🚪 Güvenli Çıkış
        </Button>
      </div>
    </div>
  );
}

export default AdminNavbar;
