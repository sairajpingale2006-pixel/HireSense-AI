import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, LayoutDashboard, UserCircle, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const { user, profile, isGuest, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSignIn = () => {
    navigate('/', { replace: true });
  };

  // Don't show on auth page
  if (location.pathname === '/') {
    return null;
  }

  if (isGuest) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2 glass-dark border border-yellow-500/30 px-3 py-1.5 rounded-lg">
          <UserCircle className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-mono text-yellow-500">Guest Mode</span>
        </div>
        <Button
          onClick={handleSignIn}
          variant="outline"
          size="sm"
          className="border-primary/30 hover:bg-primary/10 text-xs"
        >
          <LogIn className="w-3 h-3 mr-1" />
          Sign In
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={handleSignIn}
        variant="outline"
        size="sm"
        className="border-primary/30 hover:bg-primary/10"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.email?.[0].toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/30">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-dark border-white/10" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
