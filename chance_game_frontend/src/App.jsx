import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Sayfalar
import Login from './pages/Login';
import Signup from './pages/Signup';
import GamePanel from './pages/user/GamePanel';
import AdminPanel from './pages/admin/AdminPanel';
import UserManagement from './pages/admin/UserManagement';
import BetSettings from './pages/admin/BetSettings'; 
import AdminTransactions from './pages/admin/AdminTransactions'; 

// YENİ EKLEDİĞİMİZ SAYFALAR
import RoomsAdmin from './components/layout/admin/RoomsAdmin';
import BetLevelsAdmin from './components/layout/admin/BetLevelsAdmin';

// Bileşenler
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* 1. HERKESE AÇIK SAYFALAR */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 2. SADECE USER SAYFALARI */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="user">
            <GamePanel />
          </ProtectedRoute>
        } 
      />

      {/* 3. SADECE ADMIN SAYFALARI */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute requiredRole="admin">
            <BetSettings />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/transactions" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminTransactions />
          </ProtectedRoute>
        } 
      />

      {/* YENİ EKLENEN ROUTE: Bahis Seviyeleri */}
      <Route 
        path="/admin/bet-levels"
        element={
          <ProtectedRoute requiredRole="admin">
            <BetLevelsAdmin />
          </ProtectedRoute>
        }
      />

      {/* YENİ EKLENEN ROUTE: Odalar */}
      <Route 
        path="/admin/rooms"
        element={
          <ProtectedRoute requiredRole="admin">
            <RoomsAdmin />
          </ProtectedRoute>
        }
      />

      {/* 4. VARSAYILAN YÖNLENDİRME */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
