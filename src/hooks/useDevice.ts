import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const useDevicePerformance = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Check for low-end device indicators
    const checkPerformance = () => {
      const isMobile = window.innerWidth < 768;
      const hasLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const hasSlowConnection = (navigator as any).connection?.effectiveType === 'slow-2g' || 
                                 (navigator as any).connection?.effectiveType === '2g';
      
      setIsLowEnd(isMobile && (hasLowMemory || hasSlowConnection));
    };

    checkPerformance();
  }, []);

  return isLowEnd;
};
