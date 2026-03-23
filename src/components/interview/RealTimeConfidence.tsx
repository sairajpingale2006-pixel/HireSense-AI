import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RealTimeConfidence: React.FC<{ value: number }> = ({ value }) => {
  const [color, setColor] = useState('hsl(var(--primary))');

  useEffect(() => {
    if (value < 40) setColor('hsl(var(--destructive))');
    else if (value < 70) setColor('#eab308'); // yellow-500 equivalent
    else setColor('hsl(var(--primary))');
  }, [value]);

  return (
    <div className="glass-dark border border-white/10 p-4 rounded-xl space-y-2 w-full max-w-[200px]">
      <div className="flex justify-between items-center text-xs font-mono tracking-widest uppercase">
        <span className="text-muted-foreground">Confidence</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%`, backgroundColor: color }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          className="h-full rounded-full shadow-[0_0_10px_currentColor]"
        />
      </div>
    </div>
  );
};

export default RealTimeConfidence;
