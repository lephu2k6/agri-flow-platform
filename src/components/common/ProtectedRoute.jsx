import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Đang load Auth hoặc Profile
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Chưa login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã login nhưng yêu cầu role cụ thể
  if (allowedRoles.length > 0) {
    // Nếu profile chưa load xong dù đã có user (hiếm khi xảy ra với code trên)
    if (!profile) return null; 

    // Kiểm tra quyền
    if (!allowedRoles.includes(profile.role)) {
      // Sai quyền: Nông dân vào Buyer hoặc ngược lại
      const redirectPath = profile.role === 'farmer' ? '/farmer/dashboard' : '/products';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute; // BẮT BUỘC DÒNG NÀY