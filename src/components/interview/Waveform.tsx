import React from 'react';
import { motion } from 'framer-motion';

const Waveform: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-12 w-32">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: 4 }}
          animate={{ 
            height: isActive ? [4, Math.random() * 24 + 8, 4] : 4,
            opacity: isActive ? [0.4, 1, 0.4] : 0.4
          }}
          transition={{ 
            duration: 0.5 + Math.random() * 0.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05
          }}
          className="w-1.5 rounded-full bg-primary"
        />
      ))}
    </div>
  );
};

export default Waveform;
