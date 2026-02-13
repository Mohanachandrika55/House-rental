import React from 'react';
import { Navigate } from 'react-router-dom';
import { message } from 'antd';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    message.warning('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
