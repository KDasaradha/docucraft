"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, List, Eye, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TocItem {
  id: string;
  title: string;
  level: number;
  element?: HTMLElement;
}

interface TableOfContentsProps {
  content?: string;
  className?: string;
  maxLevel?: number;
  showProgress?: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  content, 
  className, 
  maxLevel = 3,
  showProgress = true 
}) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const generateToc = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const items: TocItem[] = [];

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level <= maxLevel) {
          const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
          
          // Ensure heading has an ID for navigation
          if (!heading.id && id) {
            heading.id = id;
          }

          items.push({
            id: heading.id || id,
            title: heading.textContent || '',
            level,
            element: heading as HTMLElement
          });
        }
      });

      setTocItems(items);
    };

    // Generate TOC after content loads
    const timer = setTimeout(generateToc, 100);
    
    // Regenerate on content changes
    const observer = new MutationObserver(generateToc);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['id']
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [content, maxLevel]);

  useEffect(() => {
    if (tocItems.length === 0) return;

    // Intersection Observer for active section tracking
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Get the topmost visible heading
          const topEntry = visibleEntries.reduce((top, entry) => 
            entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top
          );
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    // Observe all headings
    tocItems.forEach(item => {
      if (item.element) {
        observerRef.current?.observe(item.element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tocItems]);

  useEffect(() => {
    if (!showProgress) return;

    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();

    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, [showProgress]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const getLevelIndent = (level: number) => {
    return `${(level - 1) * 0.75}rem`;
  };

  const getLevelColor = (level: number, isActive: boolean) => {
    if (isActive) return 'text-primary';
    
    switch (level) {
      case 1: return 'text-foreground';
      case 2: return 'text-muted-foreground';
      case 3: return 'text-muted-foreground/80';
      default: return 'text-muted-foreground/60';
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("sticky top-24 w-64 shrink-0", className)}>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Table of Contents</h3>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {tocItems.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-3 w-3" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Reading Progress */}
        {showProgress && !isCollapsed && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Reading Progress</span>
              <span>{Math.round(readingProgress * 100)}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* TOC Items */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ScrollArea className="max-h-[60vh]">
                <nav className="space-y-1">
                  {tocItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => scrollToHeading(item.id)}
                      className={cn(
                        "w-full text-left text-sm py-1.5 px-2 rounded-md transition-all duration-200 hover:bg-accent group flex items-start gap-2",
                        activeId === item.id && "bg-accent/50 shadow-sm"
                      )}
                      style={{ paddingLeft: `calc(0.5rem + ${getLevelIndent(item.level)})` }}
                    >
                      <Hash 
                        className={cn(
                          "h-3 w-3 mt-0.5 shrink-0 transition-colors",
                          activeId === item.id ? "text-primary" : "text-muted-foreground/50"
                        )} 
                      />
                      <span 
                        className={cn(
                          "leading-relaxed transition-colors line-clamp-2",
                          getLevelColor(item.level, activeId === item.id),
                          item.level === 1 && "font-medium",
                          item.level === 2 && "font-normal",
                          item.level >= 3 && "text-xs"
                        )}
                      >
                        {item.title}
                      </span>
                      {activeId === item.id && (
                        <motion.div
                          className="ml-auto"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Eye className="h-3 w-3 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </nav>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground text-center">
            Click any heading to jump to section
          </div>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;