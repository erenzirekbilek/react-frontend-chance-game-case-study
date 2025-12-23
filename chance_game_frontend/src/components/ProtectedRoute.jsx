import React from 'react'; // React importu eksikse ekle
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. Eğer token yoksa direkt login'e at
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Eğer token varsa ama rol yanlışsa, kullanıcıyı kendi ana sayfasına yolla
    if (requiredRole && userRole !== requiredRole) {
        const fallbackPath = userRole === 'admin' ? '/admin' : '/dashboard';
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default ProtectedRoute;