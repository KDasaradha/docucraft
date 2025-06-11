"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, Loader2, Clock, TrendingUp, FileText, Code, Book, Sparkles, X, ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  path: string;
  type: 'page' | 'heading' | 'code' | 'api';
  category: string;
  relevanceScore: number;
  snippet: string;
  breadcrumbs: string[];
  lastModified: Date;
}

interface SearchGroup {
  category: string;
  icon: React.ElementType;
  results: SearchResult[];
  color: string;
}

// Mock search function - replace with your actual search implementation
const performSearch = async (query: string): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock results
  return [
    {
      id: '1',
      title: 'Getting Started with FastAPI',
      content: 'Learn how to build modern APIs with FastAPI...',
      path: '/docs/fastapi/getting-started',
      type: 'page',
      category: 'Guides',
      relevanceScore: 0.95,
      snippet: 'FastAPI is a modern, fast web framework for building APIs with Python...',
      breadcrumbs: ['FastAPI', 'Getting Started'],
      lastModified: new Date()
    },
    {
      id: '2',
      title: 'API Authentication',
      content: 'Secure your APIs with authentication...',
      path: '/docs/api/authentication',
      type: 'api',
      category: 'API Reference',
      relevanceScore: 0.87,
      snippet: 'Learn how to implement JWT authentication in your FastAPI application...',
      breadcrumbs: ['API', 'Authentication'],
      lastModified: new Date()
    }
  ];
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'guides': return Book;
    case 'api reference': return Code;
    case 'tutorials': return FileText;
    default: return FileText;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'guides': return 'text-blue-500';
    case 'api reference': return 'text-green-500';
    case 'tutorials': return 'text-purple-500';
    default: return 'text-gray-500';
  }
};

// Recent searches management
const RECENT_SEARCHES_KEY = 'enhanced-recent-searches';
const MAX_RECENT_SEARCHES = 5;

const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRecentSearch = (query: string) => {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

// Highlighted text component
const HighlightedText = ({ 
  text, 
  searchTerms, 
  className = "" 
}: {
  text: string;
  searchTerms: string[];
  className?: string;
}) => {
  const highlightText = (text: string, terms: string[]) => {
    if (!terms.length) return text;
    
    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      const isHighlight = terms.some(term => 
        part.toLowerCase() === term.toLowerCase()
      );
      
      return isHighlight ? (
        <mark 
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      );
    });
  };
  
  return (
    <span className={className}>
      {highlightText(text, searchTerms)}
    </span>
  );
};

// Search result item component
const SearchResultItem = ({ 
  result, 
  query, 
  isSelected, 
  onClick 
}: {
  result: SearchResult;
  query: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const searchTerms = query.split(' ').filter(term => term.length > 1);
  
  return (
    <motion.div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all duration-200 group",
        isSelected 
          ? "bg-accent border-primary shadow-md ring-1 ring-primary/20" 
          : "hover:bg-muted/50 hover:border-border hover:shadow-sm"
      )}
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      layout
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <HighlightedText
            text={result.title}
            searchTerms={searchTerms}
            className="font-medium text-sm truncate"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs">
            {Math.round(result.relevanceScore * 100)}%
          </Badge>
          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2 truncate">
        {result.breadcrumbs.join(' › ')}
      </div>
      
      <HighlightedText
        text={result.snippet}
        searchTerms={searchTerms}
        className="text-sm text-muted-foreground line-clamp-2"
      />
    </motion.div>
  );
};

export function EnhancedSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [groupedResults, setGroupedResults] = useState<SearchGroup[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Mount check for hydration
  useEffect(() => {
    setIsMounted(true);
    setRecentSearches(getRecentSearches());
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && isMounted) {
      setQuery('');
      setResults([]);
      setGroupedResults([]);
      setSelectedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMounted]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setGroupedResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await performSearch(searchQuery);
        setResults(searchResults);
        
        // Group results by category
        const grouped = groupSearchResults(searchResults);
        setGroupedResults(grouped);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setGroupedResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      debouncedSearch.cancel();
      setResults([]);
      setGroupedResults([]);
      setIsLoading(false);
    }
    
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const groupSearchResults = (results: SearchResult[]): SearchGroup[] => {
    const groups = new Map<string, SearchResult[]>();
    
    results.forEach(result => {
      const category = result.category || 'Other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(result);
    });
    
    return Array.from(groups.entries()).map(([category, results]) => ({
      category,
      results: results.sort((a, b) => b.relevanceScore - a.relevanceScore),
      icon: getCategoryIcon(category),
      color: getCategoryColor(category)
    }));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      // Only handle these keys when dialog is open
      if (!isOpen) return;

      const totalResults = results.length + recentSearches.length;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalResults);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev <= 0 ? totalResults - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          handleSelectResult();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, recentSearches, query]);

  const handleSelectResult = () => {
    if (selectedIndex >= 0) {
      if (selectedIndex < results.length) {
        // Navigate to selected result
        const result = results[selectedIndex];
        addRecentSearch(query);
        window.location.href = result.path;
        setIsOpen(false);
      } else {
        // Handle recent search selection
        const recentIndex = selectedIndex - results.length;
        if (recentIndex >= 0 && recentIndex < recentSearches.length) {
          setQuery(recentSearches[recentIndex]);
        }
      }
    }
  };

  const handleRecentSearchClick = useCallback((search: string) => {
    setQuery(search);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());
    window.location.href = result.path;
    setIsOpen(false);
  }, [query]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 h-9"
        >
          <Search className="mr-2 h-4 w-4" />
          Search documentation...
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            ref={inputRef}
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          <AnimatePresence mode="wait">
            {!query && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <motion.div
                          key={search}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer transition-colors",
                            selectedIndex === results.length + index && "bg-accent"
                          )}
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          <Search className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quick Tips */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Search Tips
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• Use quotes for exact phrases: "FastAPI tutorial"</div>
                    <div>• Search by category: api:authentication</div>
                    <div>• Use keyboard shortcuts: ↑↓ to navigate, ↵ to select</div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Search Results */}
            {query && !isLoading && groupedResults.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                {groupedResults.map((group, groupIndex) => (
                  <motion.div
                    key={group.category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <group.icon className={`w-4 h-4 ${group.color}`} />
                      {group.category}
                      <Badge variant="secondary" className="text-xs">
                        {group.results.length}
                      </Badge>
                    </h3>
                    
                    <div className="space-y-2">
                      {group.results.map((result, resultIndex) => {
                        const globalIndex = groupedResults
                          .slice(0, groupIndex)
                          .reduce((acc, g) => acc + g.results.length, 0) + resultIndex;
                        
                        return (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            query={query}
                            isSelected={selectedIndex === globalIndex}
                            onClick={() => handleResultClick(result)}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Loading State */}
            {query && isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching...</p>
              </motion.div>
            )}
            
            {/* No Results */}
            {query && !isLoading && groupedResults.length === 0 && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center text-muted-foreground"
              >
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try adjusting your search terms</p>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
        {/* Search Footer */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-background rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-background rounded text-xs">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-background rounded text-xs">Esc</kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1">
            Powered by <Sparkles className="w-3 h-3" /> AI
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}