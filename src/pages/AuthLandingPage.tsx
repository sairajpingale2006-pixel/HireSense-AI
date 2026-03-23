import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import AIBrain from '@/components/3d/AIBrain';
import { useAuth } from '@/context/AuthContext';
import { UserCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useDevice';

const AuthLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/landing');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background data stream animation - simplified on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: "-20%", left: `${i * 4}%`, opacity: 0 }}
              animate={{ top: "120%", opacity: [0, 1, 0] }}
              transition={{ 
                duration: 3 + Math.random() * 7, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 5 
              }}
              className="absolute w-[2px] h-64 bg-gradient-to-b from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgba(0,163,255,0.3)]"
            />
          ))}
        </div>
      )}

      {/* 3D Brain visualization - hidden on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-60 pointer-events-none">
          <div className="w-full h-full max-w-4xl max-h-[80vh]">
            <AIBrain />
          </div>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-20 text-center space-y-6 md:space-y-8 w-full max-w-md"
      >
        <div className="space-y-3 md:space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase text-primary mb-3 md:mb-4"
          >
            Neural Protocol v4.2 Active
          </motion.div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter gradient-text drop-shadow-[0_0_15px_rgba(0,163,255,0.3)]">
            HireSense AI
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-light tracking-wide px-4">
            Next-generation virtual HR for immersive real-time interview evaluation
          </p>
        </div>

        {/* Auth Options */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-dark border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6 backdrop-blur-xl"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Get Started</h2>

          <Button 
            size="lg" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-white/90 h-12 md:h-14 text-base md:text-lg rounded-xl transition-all duration-300 active:scale-95 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={handleGuestMode}
            variant="outline"
            className="w-full border-white/20 hover:bg-white/5 h-12 md:h-14 text-base md:text-lg rounded-xl transition-all duration-300 active:scale-95"
          >
            <UserCircle className="w-5 h-5 mr-2" />
            Continue as Guest
          </Button>

          <div className="pt-3 md:pt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-yellow-500" />
              <span>Guest mode – history will not be saved</span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              Sign in to track your progress and access past interviews
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer HUD elements - hidden on mobile */}
      {!isMobile && (
        <div className="absolute bottom-10 left-10 flex flex-col space-y-2 opacity-40">
          <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             <span className="text-[8px] font-mono tracking-widest uppercase">Syncing Neural Core...</span>
          </div>
          <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
             <span className="text-[8px] font-mono tracking-widest uppercase">Scanning Environment...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLandingPage;
