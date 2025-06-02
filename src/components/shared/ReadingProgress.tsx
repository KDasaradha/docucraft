"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface ReadingProgressProps {
  target?: React.RefObject<HTMLElement>;
  className?: string;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ target, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: target?.current ? target : undefined,
    offset: target ? ["start end", "end start"] : ["start start", "end end"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setIsVisible(latest > 0.05 && latest < 0.95);
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 h-1 bg-primary origin-left ${className}`}
      style={{ scaleX }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    />
  );
};

export default ReadingProgress;