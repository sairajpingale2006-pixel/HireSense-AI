import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_ROUTES = ['/'];
const AUTH_REQUIRED_ROUTES = ['/dashboard'];

export const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = user !== null || isGuest;
    const isAuthPage = location.pathname === '/';
    const isDashboard = location.pathname === '/dashboard';

    // If on auth page and already authenticated, redirect to landing
    if (isAuthPage && isAuthenticated) {
      navigate('/landing', { replace: true });
      return;
    }

    // If trying to access dashboard without being logged in
    if (isDashboard && !user) {
      // Don't redirect, let the DashboardPage show the sign-in prompt
      return;
    }

    // If not authenticated and not on auth page, redirect to auth
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(location.pathname)) {
      navigate('/', { replace: true });
    }
  }, [user, isGuest, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl font-mono">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};
