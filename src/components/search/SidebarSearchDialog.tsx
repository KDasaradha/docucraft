"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, FileText, ChevronRight, Hash, BookOpen, Layers, Zap, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItem } from "@/lib/docs";
import { Separator } from "@/components/ui/separator";

interface SidebarSearchDialogProps {
  navigationItems: NavItem[];
  onNavigate?: (href: string) => void;
}

interface FlatNavItem {
  title: string;
  href: string;
  breadcrumb: string[];
  level: number;
  type: 'page' | 'section' | 'guide' | 'api';
  description?: string;
  tags?: string[];
}

function flattenNavigation(items: NavItem[], breadcrumb: string[] = [], level: number = 0): FlatNavItem[] {
  const result: FlatNavItem[] = [];
  
  for (const item of items) {
    // Only include items with valid hrefs that aren't just anchors
    if (item.href && item.href !== '#' && !item.isExternal) {
      // Determine item type based on path and level
      let type: FlatNavItem['type'] = 'page';
      if (item.href.includes('/api/')) type = 'api';
      else if (item.href.includes('/guide/')) type = 'guide';
      else if (level === 0) type = 'section';
      
      // Extract potential tags from title or path
      const tags: string[] = [];
      if (item.href.includes('/api/')) tags.push('API');
      if (item.href.includes('/guide/')) tags.push('Guide');
      if (item.href.includes('/tutorial/')) tags.push('Tutorial');
      if (item.href.includes('/example/')) tags.push('Example');
      
      result.push({
        title: item.title,
        href: item.href,
        breadcrumb: [...breadcrumb],
        level,
        type,
        tags
      });
    }
    
    // Recursively process children
    if (item.items && item.items.length > 0) {
      const newBreadcrumb = item.href && item.href !== '#' ? [...breadcrumb, item.title] : breadcrumb;
      result.push(...flattenNavigation(item.items, newBreadcrumb, level + 1));
    }
  }
  
  return result;
}

export function SidebarSearchDialog({ navigationItems, onNavigate }: SidebarSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Flatten navigation items for searching
  const flatNavItems = useMemo(() => flattenNavigation(navigationItems), [navigationItems]);

  // Enhanced filter results with better scoring
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const results = flatNavItems
      .map(item => {
        let score = 0;
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const breadcrumbMatch = item.breadcrumb.some(crumb => 
          crumb.toLowerCase().includes(searchTerm)
        );
        const tagMatch = item.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
        
        // Scoring system
        if (item.title.toLowerCase() === searchTerm) score += 100;
        else if (item.title.toLowerCase().startsWith(searchTerm)) score += 80;
        else if (titleMatch) score += 60;
        
        if (breadcrumbMatch) score += 30;
        if (tagMatch) score += 20;
        
        // Boost certain types
        if (item.type === 'api') score += 10;
        if (item.type === 'guide') score += 5;
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Limit to 8 results for better UX
    
    return results;
  }, [query, flatNavItems]);

  // Mount check for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && isMounted) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMounted]);

  // Handle outside click to close dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && event.target instanceof Element) {
        const dialogContent = event.target.closest('[role="dialog"]');
        if (!dialogContent) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'Tab':
          if (e.key === 'Tab' && e.shiftKey) break; // Let Shift+Tab work normally
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : 0 // Wrap to beginning
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredResults.length - 1 // Wrap to end
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleNavigate(filteredResults[selectedIndex].href);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(filteredResults.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const handleNavigate = useCallback((href: string) => {
    setIsOpen(false);
    onNavigate?.(href);
    // Navigate to the href
    window.location.href = href;
  }, [onNavigate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const getItemIcon = (type: FlatNavItem['type']) => {
    switch (type) {
      case 'api':
        return <Hash className="h-4 w-4 text-blue-500" />;
      case 'guide':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'section':
        return <Layers className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getItemBadge = (item: FlatNavItem) => {
    if (item.tags && item.tags.length > 0) {
      return (
        <Badge variant="outline" className="text-xs">
          {item.tags[0]}
        </Badge>
      );
    }
    return null;
  };

  const renderBreadcrumb = (breadcrumb: string[]) => {
    if (breadcrumb.length === 0) return null;
    
    return (
      <div className="flex items-center text-xs text-muted-foreground mb-2 font-medium">
        {breadcrumb.map((crumb, index) => (
          <React.Fragment key={index}>
            <span className="truncate max-w-[120px]" title={crumb}>
              {crumb}
            </span>
            {index < breadcrumb.length - 1 && (
              <ChevronRight className="h-3 w-3 mx-1 shrink-0 opacity-60" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-100 dark:bg-yellow-900/50 text-foreground font-semibold rounded px-1 py-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isMounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start text-muted-foreground opacity-50"
        disabled
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="text-sm">Quick search...</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          aria-label="Open quick navigation search"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Quick search...</span>
          <kbd className="ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>/
          </kbd>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 max-h-[80vh] overflow-hidden"
        aria-describedby="search-dialog-description"
      >
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Navigation
          </DialogTitle>
          <p id="search-dialog-description" className="sr-only">
            Search through navigation items using keyboard shortcuts. Use arrow keys to navigate and Enter to select.
          </p>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search navigation..."
              className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              value={query}
              onChange={handleInputChange}
              autoComplete="off"
              spellCheck="false"
              aria-label="Search navigation items"
              aria-expanded={filteredResults.length > 0}
              aria-activedescendant={filteredResults[selectedIndex] ? `search-result-${selectedIndex}` : undefined}
              role="combobox"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div ref={resultsRef} className="p-2" role="listbox" aria-label="Search results">
            {query.trim() === '' ? (
              <div className="text-center text-muted-foreground py-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                </motion.div>
                <motion.p 
                  className="font-medium text-base mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Start typing to search
                </motion.p>
                <motion.p 
                  className="text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Find pages quickly by title or section
                </motion.p>
                <motion.div 
                  className="mt-6 space-y-2 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-xs">API</Badge>
                    <Badge variant="outline" className="text-xs">Guide</Badge>
                    <Badge variant="outline" className="text-xs">Tutorial</Badge>
                  </div>
                  <p className="text-muted-foreground">Search by content type</p>
                </motion.div>
              </div>
            ) : filteredResults.length === 0 ? (
              <motion.div 
                className="text-center text-muted-foreground py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium text-base mb-2">No results found</p>
                <p className="text-sm mb-4">Try different keywords or check spelling</p>
                <div className="text-xs space-y-1">
                  <p>• Use simpler terms</p>
                  <p>• Try searching by section name</p>
                  <p>• Look for API or guide content</p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
                  }}
                  className="space-y-1"
                >
                  {filteredResults.map((result, index) => (
                    <motion.div
                      key={result.href}
                      id={`search-result-${index}`}
                      variants={{ 
                        hidden: { y: 10, opacity: 0, scale: 0.95 }, 
                        visible: { y: 0, opacity: 1, scale: 1 } 
                      }}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-all duration-200 group",
                        "hover:bg-accent hover:shadow-sm focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20",
                        selectedIndex === index && "bg-accent shadow-sm ring-2 ring-primary/20"
                      )}
                      onClick={() => handleNavigate(result.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      role="option"
                      aria-selected={selectedIndex === index}
                      tabIndex={selectedIndex === index ? 0 : -1}
                      title={result.title}
                    >
                      {renderBreadcrumb(result.breadcrumb)}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {getItemIcon(result.type)}
                          <span className="font-medium text-sm leading-5 truncate">
                            {highlightMatch(result.title, query)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          {getItemBadge(result)}
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
        
        {filteredResults.length > 0 && (
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">⎋</kbd>
                  Close
                </span>
              </div>
              <span className="font-medium">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}