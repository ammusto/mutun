import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet, Navigate } from 'react-router-dom';
import LoadingGif from '../utils/LoadingGif';

interface Auth0Context {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth0<Auth0Context>();

  if (isLoading) {
    return <LoadingGif />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;