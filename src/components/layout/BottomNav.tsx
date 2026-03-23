import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, Briefcase, BarChart3, LayoutDashboard } from 'lucide-react';

const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show on auth page
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-lg min-w-[64px] min-h-[56px] transition-all ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground active:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
