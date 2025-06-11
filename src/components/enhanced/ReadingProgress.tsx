"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, BookOpen, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  className?: string;
  showBackToTop?: boolean;
  showReadingTime?: boolean;
  showScrollIndicator?: boolean;
}

// Hook for reading progress
const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      setProgress(progress);
      setIsVisible(scrollTop > 100);
      
      // Determine scroll direction
      const direction = scrollTop > lastScrollY ? 'down' : 'up';
      if (Math.abs(scrollTop - lastScrollY) > 10) {
        setScrollDirection(direction);
      }
      
      lastScrollY = scrollTop;
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };
    
    // Calculate reading time based on content
    const calculateReadingTime = () => {
      const content = document.querySelector('main, article, .prose');
      if (content) {
        const text = content.textContent || '';
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const time = Math.ceil(words / wordsPerMinute);
        setReadingTime(time);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateReadingTime();
    updateProgress();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return { progress, isVisible, readingTime, scrollDirection };
};

// Back to top button component
const BackToTopButton = ({ isVisible }: { isVisible: boolean }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="sm"
            className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Reading stats component
const ReadingStats = ({ 
  readingTime, 
  progress, 
  isVisible 
}: { 
  readingTime: number; 
  progress: number; 
  isVisible: boolean; 
}) => {
  const estimatedTimeLeft = Math.max(0, Math.ceil(readingTime * (1 - progress / 100)));
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg max-w-xs"
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>Reading Progress</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{Math.round(progress)}% complete</span>
                <span>{estimatedTimeLeft}m left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <motion.div
                  className="bg-primary h-1.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{readingTime}m read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>~{Math.round(progress * readingTime / 100)}m</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main reading progress component
export function ReadingProgress({ 
  className,
  showBackToTop = true,
  showReadingTime = false,
  showScrollIndicator = true
}: ReadingProgressProps) {
  const { progress, isVisible, readingTime, scrollDirection } = useReadingProgress();
  
  return (
    <>
      {/* Progress bar at top */}
      {showScrollIndicator && (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ 
                opacity: scrollDirection === 'down' ? 0.7 : 1, 
                y: 0 
              }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "fixed top-0 left-0 right-0 z-50 h-1 bg-background/80 backdrop-blur-sm",
                className
              )}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-primary/80 to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              />
              
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: [`-80px`, `calc(100vw + 80px)`]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {/* Reading stats sidebar */}
      {showReadingTime && (
        <ReadingStats 
          readingTime={readingTime} 
          progress={progress} 
          isVisible={isVisible && progress > 5 && progress < 95} 
        />
      )}
      
      {/* Back to top button */}
      {showBackToTop && (
        <BackToTopButton isVisible={isVisible && progress > 20} />
      )}
    </>
  );
}

// Circular progress variant
export function CircularReadingProgress({ 
  size = 60,
  strokeWidth = 4,
  className 
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const { progress, isVisible } = useReadingProgress();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn(
            "fixed bottom-6 right-6 z-50 cursor-pointer group",
            className
          )}
          onClick={scrollToTop}
        >
          <div className="relative">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 drop-shadow-lg"
            >
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-muted/20"
              />
              
              {/* Progress circle */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="text-primary transition-colors duration-300"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </svg>
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background rounded-full p-2 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <ArrowUp className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded shadow-sm">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for external use
export { useReadingProgress };