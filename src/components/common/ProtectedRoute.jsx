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


  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 
  if (allowedRoles.length > 0) {

    if (!profile) return null; 


    if (!allowedRoles.includes(profile.role)) {
   
      const redirectPath = profile.role === 'farmer' ? '/farmer/dashboard' : '/products';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute; // BẮT BUỘC DÒNG NÀY