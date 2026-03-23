import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import LoadingOverlay from './components/layout/LoadingOverlay';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import UserProfile from '@/components/common/UserProfile';
import BottomNav from '@/components/layout/BottomNav';
import { Home, Briefcase, BarChart3, LayoutDashboard, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import routes from './routes';

const NavBar: React.FC = () => {
  const { user, isGuest } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Don't show navbar on auth page
  if (location.pathname === '/') {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/landing', icon: Home },
    { name: 'Interview', path: '/interview', icon: Briefcase },
    { name: 'Results', path: '/result', icon: BarChart3 },
  ];

  // Add Dashboard only for logged-in users
  if (user) {
    navItems.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link to="/landing" className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs md:text-sm font-mono tracking-widest uppercase text-primary/80">HireSense AI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="flex items-center space-x-1">
            <NavLinks />
          </div>
        </div>
        
        <UserProfile />
      </div>
      
      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-yellow-500/10 border-t border-yellow-500/20 px-4 md:px-6 py-2">
          <p className="text-xs text-yellow-500 text-center font-medium">
            ⚠️ Guest mode active – Sign in to track your progress
          </p>
        </div>
      )}
    </nav>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <>
      <LoadingOverlay />
      <IntersectObserver />
      <div className="flex flex-col min-h-screen">
        <NavBar />
        
        <main className={`flex-grow ${isAuthPage ? '' : 'md:pt-20 pb-20 md:pb-0'}`}>
          <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
      <Toaster />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <RouteGuard>
          <AppContent />
        </RouteGuard>
      </AuthProvider>
    </Router>
  );
};

export default App;

