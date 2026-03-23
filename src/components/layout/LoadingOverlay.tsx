import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const LoadingOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-24 h-24">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border-t-2 border-primary rounded-full shadow-[0_0_15px_rgba(0,163,255,0.5)]"
               />
               <motion.div 
                 animate={{ rotate: -360 }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-2 border-r-2 border-secondary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
               </div>
            </div>
            
            <div className="flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm font-mono tracking-[0.4em] uppercase text-primary/80"
              >
                AI is analyzing...
              </motion.span>
              <div className="flex space-x-1 mt-2">
                 <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ delay: 0.1, repeat: Infinity }} className="w-1 h-1 bg-primary" />
                 <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ delay: 0.2, repeat: Infinity }} className="w-1 h-1 bg-primary" />
                 <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ delay: 0.3, repeat: Infinity }} className="w-1 h-1 bg-primary" />
              </div>
            </div>
          </div>
          
          {/* Futuristic Data Stream Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden opacity-10">
             {Array.from({ length: 20 }).map((_, i) => (
               <motion.div 
                 key={i}
                 initial={{ top: "-100%", left: `${(i * 5)}%` }}
                 animate={{ top: "110%" }}
                 transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                 className="absolute w-[1px] h-32 bg-gradient-to-b from-transparent via-primary to-transparent"
               />
             ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
