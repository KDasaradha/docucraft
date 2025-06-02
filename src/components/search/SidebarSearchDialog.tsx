"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, FileText, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { NavItem } from "@/lib/docs";

interface SidebarSearchDialogProps {
  navigationItems: NavItem[];
  onNavigate?: (href: string) => void;
}

interface FlatNavItem {
  title: string;
  href: string;
  breadcrumb: string[];
  level: number;
}

function flattenNavigation(items: NavItem[], breadcrumb: string[] = [], level: number = 0): FlatNavItem[] {
  const result: FlatNavItem[] = [];
  
  for (const item of items) {
    // Only include items with valid hrefs that aren't just anchors
    if (item.href && item.href !== '#' && !item.isExternal) {
      result.push({
        title: item.title,
        href: item.href,
        breadcrumb: [...breadcrumb],
        level
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
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Flatten navigation items for searching
  const flatNavItems = useMemo(() => flattenNavigation(navigationItems), [navigationItems]);

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return flatNavItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.breadcrumb.some(crumb => crumb.toLowerCase().includes(searchTerm))
    ).slice(0, 10); // Limit to 10 results for performance
  }, [query, flatNavItems]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    onNavigate?.(href);
    // Navigate to the href
    window.location.href = href;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          aria-label="Open quick navigation search"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Quick search...</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 bg-background/95 backdrop-blur-sm"
        style={{
          position: 'fixed',
          left: '20%',
          top: '20%',
          transform: 'translate(-50%, -50%)',
          margin: '0'
        }}
        aria-describedby="search-dialog-description"
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-semibold">Quick Navigation</DialogTitle>
          <p id="search-dialog-description" className="sr-only">
            Search through navigation items using keyboard shortcuts. Use arrow keys to navigate and Enter to select.
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => setIsOpen(false)}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <div className="flex items-center bg-muted/50 rounded-md focus-within:ring-2 focus-within:ring-primary transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-3 mr-2" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search navigation..."
              className="flex-1 h-10 border-0 shadow-none focus-visible:ring-0 bg-transparent px-3 py-2"
              value={query}
              onChange={handleInputChange}
              autoComplete="off"
              spellCheck="false"
              aria-label="Search navigation items"
              aria-expanded={filteredResults.length > 0}
              aria-activedescendant={filteredResults[selectedIndex] ? `search-result-${selectedIndex}` : undefined}
              role="combobox"
            />
          </div>
        </div>
        
        <ScrollArea className="max-h-96">
          <div ref={resultsRef} className="p-2" role="listbox" aria-label="Search results">
            {query.trim() === '' ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground/70" />
                <p className="font-medium text-base">Start typing to search</p>
                <p className="text-sm">Find pages quickly by title or section</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-3 text-muted-foreground/70" />
                <p className="font-medium text-base">No results found</p>
                <p className="text-sm">Try different keywords</p>
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.02 } }
                  }}
                  className="space-y-1"
                >
                  {filteredResults.map((result, index) => (
                    <motion.div
                      key={result.href}
                      id={`search-result-${index}`}
                      variants={{ 
                        hidden: { y: 10, opacity: 0 }, 
                        visible: { y: 0, opacity: 1 } 
                      }}
                      className={cn(
                        "p-3 rounded-md cursor-pointer transition-all duration-200",
                        "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
                        "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
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
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm leading-5 truncate flex-1">
                          {highlightMatch(result.title, query)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
        
        {filteredResults.length > 0 && (
          <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>⎋ Close</span>
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