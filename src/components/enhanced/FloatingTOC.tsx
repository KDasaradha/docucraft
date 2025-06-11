"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronRight, Eye, EyeOff, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  title: string;
  level: number;
  element?: HTMLElement;
}

interface FloatingTOCProps {
  className?: string;
  maxItems?: number;
  showProgress?: boolean;
  collapsible?: boolean;
  autoHide?: boolean;
  position?: 'right' | 'left';
}

// Hook to extract headings from the page
const useTableOfContents = (maxItems: number = 10) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  
  useEffect(() => {
    // Extract headings from the page
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingArray: TOCItem[] = [];
      
      headingElements.forEach((heading, index) => {
        const element = heading as HTMLElement;
        let id = element.id;
        
        // Generate ID if not present
        if (!id) {
          id = `heading-${index}-${element.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'untitled'}`;
          element.id = id;
        }
        
        const level = parseInt(element.tagName.charAt(1));
        const title = element.textContent || '';
        
        if (title.trim()) {
          headingArray.push({
            id,
            title: title.trim(),
            level,
            element
          });
        }
      });
      
      setHeadings(headingArray.slice(0, maxItems));
    };
    
    // Extract headings after a short delay to ensure content is loaded
    const timer = setTimeout(extractHeadings, 100);
    
    // Re-extract if content changes
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      setTimeout(extractHeadings, 100);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [maxItems]);
  
  // Track active heading
  useEffect(() => {
    if (headings.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the heading that's most visible
        let mostVisible = entries[0];
        let maxRatio = 0;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisible = entry;
          }
        });
        
        if (mostVisible && mostVisible.isIntersecting) {
          setActiveId(mostVisible.target.id);
        }
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );
    
    headings.forEach((heading) => {
      if (heading.element) {
        observer.observe(heading.element);
      }
    });
    
    return () => observer.disconnect();
  }, [headings]);
  
  return { headings, activeId };
};

// Hook for scroll-based visibility
const useScrollVisibility = (threshold: number = 300) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateVisibility = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction);
      }
      
      setIsVisible(scrollY > threshold);
      lastScrollY = scrollY;
      ticking = false;
    };
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateVisibility();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  
  return { isVisible, scrollDirection };
};

// Progress indicator for each heading
const HeadingProgress = ({ heading, isActive }: { heading: TOCItem; isActive: boolean }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!heading.element) return;
    
    const updateProgress = () => {
      const element = heading.element!;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      const elementHeight = rect.height;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (scrollTop < elementTop) {
        setProgress(0);
      } else if (scrollTop > elementTop + elementHeight) {
        setProgress(100);
      } else {
        const progress = Math.min(100, Math.max(0, 
          ((scrollTop - elementTop) / elementHeight) * 100
        ));
        setProgress(progress);
      }
    };
    
    const handleScroll = () => requestAnimationFrame(updateProgress);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [heading.element]);
  
  return (
    <div className="w-1 h-full bg-muted rounded-full overflow-hidden">
      <motion.div
        className={cn(
          "w-full rounded-full transition-colors duration-200",
          isActive ? "bg-primary" : "bg-muted-foreground/30"
        )}
        initial={{ height: 0 }}
        animate={{ height: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

// TOC Item component
const TOCItemComponent = ({ 
  heading, 
  isActive, 
  onClick, 
  showProgress 
}: {
  heading: TOCItem;
  isActive: boolean;
  onClick: () => void;
  showProgress: boolean;
}) => {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-200 group",
        isActive 
          ? "bg-primary/10 text-primary border-l-2 border-primary" 
          : "hover:bg-muted/50 hover:text-foreground text-muted-foreground border-l-2 border-transparent"
      )}
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      {showProgress && (
        <HeadingProgress heading={heading} isActive={isActive} />
      )}
      
      <div 
        className="flex-1 min-w-0"
        style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}
      >
        <div className="flex items-center gap-1">
          {heading.level > 1 && (
            <ChevronRight className="w-3 h-3 opacity-50" />
          )}
          <span className={cn(
            "text-sm truncate transition-all duration-200",
            isActive ? "font-medium" : "font-normal"
          )}>
            {heading.title}
          </span>
        </div>
      </div>
      
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-1.5 h-1.5 bg-primary rounded-full"
        />
      )}
    </motion.div>
  );
};

export function FloatingTOC({
  className,
  maxItems = 10,
  showProgress = true,
  collapsible = true,
  autoHide = true,
  position = 'right'
}: FloatingTOCProps) {
  const { headings, activeId } = useTableOfContents(maxItems);
  const { isVisible, scrollDirection } = useScrollVisibility(300);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  // Auto-hide based on scroll direction
  useEffect(() => {
    if (autoHide) {
      setIsHidden(scrollDirection === 'down');
    }
  }, [scrollDirection, autoHide]);
  
  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      const yOffset = -80; // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      // Add highlight effect
      element.classList.add('toc-highlight');
      setTimeout(() => {
        element.classList.remove('toc-highlight');
      }, 2000);
    }
  };
  
  if (headings.length === 0) return null;
  
  return (
    <AnimatePresence>
      {isVisible && !isHidden && (
        <motion.div
          initial={{ opacity: 0, x: position === 'right' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position === 'right' ? 20 : -20 }}
          className={cn(
            "fixed z-40 max-w-xs",
            position === 'right' ? "right-6" : "left-6",
            "top-1/2 transform -translate-y-1/2",
            className
          )}
        >
          <Card className="shadow-lg backdrop-blur-sm bg-background/95 border">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium">On this page</h3>
                <Badge variant="secondary" className="text-xs">
                  {headings.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                  >
                    {isCollapsed ? (
                      <Maximize2 className="w-3 h-3" />
                    ) : (
                      <Minimize2 className="w-3 h-3" />
                    )}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsHidden(true)}
                >
                  <EyeOff className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="max-h-64 p-3">
                    <div className="space-y-1">
                      {headings.map((heading, index) => (
                        <motion.div
                          key={heading.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <TOCItemComponent
                            heading={heading}
                            isActive={activeId === heading.id}
                            onClick={() => scrollToHeading(heading.id)}
                            showProgress={showProgress}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Footer */}
            <div className="px-3 py-2 border-t bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {headings.findIndex(h => h.id === activeId) + 1} of {headings.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs p-1"
                  onClick={() => setIsHidden(false)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Show
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact version for mobile
export function CompactTOC({ headings, activeId, onItemClick }: {
  headings: TOCItem[];
  activeId: string;
  onItemClick: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeHeading = headings.find(h => h.id === activeId);
  const currentIndex = headings.findIndex(h => h.id === activeId);
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {activeHeading?.title || 'Table of Contents'}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {currentIndex + 1}/{headings.length}
          </Badge>
          <ChevronRight className={cn(
            "w-3 h-3 transition-transform duration-200",
            isOpen && "rotate-90"
          )} />
        </div>
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 z-50"
          >
            <Card className="shadow-lg">
              <ScrollArea className="max-h-48">
                <div className="p-2 space-y-1">
                  {headings.map((heading) => (
                    <TOCItemComponent
                      key={heading.id}
                      heading={heading}
                      isActive={activeId === heading.id}
                      onClick={() => {
                        onItemClick(heading.id);
                        setIsOpen(false);
                      }}
                      showProgress={false}
                    />
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// CSS for highlight effect (add to your global styles)
export const tocStyles = `
.toc-highlight {
  background: linear-gradient(120deg, #fbbf24 0%, #f59e0b 100%);
  animation: toc-highlight-pulse 2s ease-in-out;
  padding: 0.25rem;
  margin: -0.25rem;
  border-radius: 0.375rem;
}

@keyframes toc-highlight-pulse {
  0%, 100% { 
    background: transparent; 
    transform: scale(1);
  }
  50% { 
    background: rgba(251, 191, 36, 0.2);
    transform: scale(1.02);
  }
}
`;

export { useTableOfContents };