"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/docs";

// Reuse the same interfaces and utilities from ProfessionalSearchDialog
interface SearchResult {
  id: string;
  title: string;
  href: string;
  breadcrumb: string[];
  type: 'page' | 'section' | 'api' | 'guide' | 'example';
  score: number;
}

interface CompactSearchDialogProps {
  navigationItems: NavItem[];
  onNavigate?: (href: string) => void;
  placeholder?: string;
  className?: string;
}

// Flatten navigation for search (same as professional version but simplified)
function flattenNavigation(items: NavItem[], breadcrumb: string[] = []): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const item of items) {
    if (item.href && item.href !== '#' && !item.isExternal) {
      let type: SearchResult['type'] = 'page';
      
      if (item.href.includes('/api/')) type = 'api';
      else if (item.href.includes('/guide/')) type = 'guide';
      else if (item.items && item.items.length > 0) type = 'section';
      
      results.push({
        id: `nav-${item.href}`,
        title: item.title,
        href: item.href,
        breadcrumb: [...breadcrumb],
        type,
        score: 0,
      });
    }
    
    if (item.items && item.items.length > 0) {
      const newBreadcrumb = item.href && item.href !== '#' 
        ? [...breadcrumb, item.title] 
        : breadcrumb;
      results.push(...flattenNavigation(item.items, newBreadcrumb));
    }
  }
  
  return results;
}

// Simplified search scoring
function scoreResult(result: SearchResult, query: string): number {
  const searchTerm = query.toLowerCase();
  const titleLower = result.title.toLowerCase();
  let score = 0;
  
  if (titleLower === searchTerm) score += 1000;
  else if (titleLower.startsWith(searchTerm)) score += 800;
  else if (titleLower.includes(searchTerm)) score += 500;
  
  if (result.breadcrumb.join(' ').toLowerCase().includes(searchTerm)) score += 200;
  
  return score;
}

export function CompactSearchDialog({ 
  navigationItems, 
  onNavigate, 
  placeholder = "Quick search...",
  className 
}: CompactSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const flatResults = useMemo(() => flattenNavigation(navigationItems), [navigationItems]);
  
  // Perform search
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = flatResults
      .map(result => ({
        ...result,
        score: scoreResult(result, searchQuery)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Limit to 5 results for compact view
    
    setSearchResults(results);
    setSelectedIndex(0);
  }, [flatResults]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [query, performSearch]);
  
  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            handleNavigate(searchResults[selectedIndex].href);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);
  
  const handleNavigate = useCallback((href: string) => {
    setIsOpen(false);
    onNavigate?.(href);
    window.location.href = href;
  }, [onNavigate]);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50",
            "transition-all duration-200 h-8 px-3 rounded-md",
            className
          )}
          aria-label="Open quick search"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm truncate">{placeholder}</span>
          <div className="ml-auto">
            <kbd className="hidden sm:inline-flex h-4 w-4 items-center justify-center rounded bg-muted text-[10px] font-medium">
              <Command className="h-2.5 w-2.5" />
            </kbd>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-md max-h-[70vh] p-0 gap-0 dialog-top-left"
        aria-label="Quick search dialog"
      >
        {/* Compact Header */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search..."
              className="pl-10 pr-10 h-10 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              spellCheck="false"
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
        
        {/* Compact Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {query.trim() === '' ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Start typing to search</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                      "hover:bg-accent",
                      selectedIndex === index && "bg-accent"
                    )}
                    onClick={() => handleNavigate(result.href)}
                  >
                    <div className="shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary/60" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.title}
                      </p>
                      {result.breadcrumb.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.breadcrumb.join(' › ')}
                        </p>
                      )}
                    </div>
                    
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No results found</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Compact Footer */}
        {searchResults.length > 0 && (
          <div className="px-4 py-2 border-t bg-muted/5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{searchResults.length} results</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1 py-0.5 bg-background rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
                <kbd className="px-1 py-0.5 bg-background rounded text-xs">↵</kbd>
                <span>Select</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}