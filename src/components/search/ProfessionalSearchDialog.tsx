"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Search, 
  X, 
  ArrowRight, 
  Clock, 
  FileText, 
  Hash, 
  BookOpen, 
  Zap, 
  TrendingUp,
  Command,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Filter
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/docs";

// Enhanced search result interface
interface SearchResult {
  id: string;
  title: string;
  href: string;
  description?: string;
  content?: string;
  breadcrumb: string[];
  type: 'page' | 'section' | 'api' | 'guide' | 'example';
  score: number;
  isNew?: boolean;
  category: string;
  tags?: string[];
  lastUpdated?: Date;
}

interface ProfessionalSearchDialogProps {
  navigationItems: NavItem[];
  onNavigate?: (href: string) => void;
  placeholder?: string;
  className?: string;
}

// Mock recent searches and popular content
const recentSearches = [
  "API Authentication",
  "Getting Started",
  "Database Setup",
  "Deployment Guide"
];

const popularContent = [
  { title: "Quick Start Guide", href: "/docs/getting-started", type: "guide" as const },
  { title: "API Reference", href: "/docs/api", type: "api" as const },
  { title: "Best Practices", href: "/docs/best-practices", type: "guide" as const },
  { title: "Troubleshooting", href: "/docs/troubleshooting", type: "guide" as const }
];

// Flatten navigation for search
function flattenNavigation(items: NavItem[], breadcrumb: string[] = []): SearchResult[] {
  const results: SearchResult[] = [];
  
  for (const item of items) {
    if (item.href && item.href !== '#' && !item.isExternal) {
      // Determine type based on path patterns
      let type: SearchResult['type'] = 'page';
      let category = 'Documentation';
      
      if (item.href.includes('/api/')) {
        type = 'api';
        category = 'API Reference';
      } else if (item.href.includes('/guide/')) {
        type = 'guide';
        category = 'Guides';
      } else if (item.href.includes('/example/')) {
        type = 'example';
        category = 'Examples';
      } else if (item.items && item.items.length > 0) {
        type = 'section';
        category = 'Sections';
      }
      
      // Extract tags from title and path
      const tags: string[] = [];
      if (item.href.includes('/api/')) tags.push('API');
      if (item.href.includes('/guide/')) tags.push('Guide');
      if (item.href.includes('/tutorial/')) tags.push('Tutorial');
      if (item.title.toLowerCase().includes('new')) tags.push('New');
      
      results.push({
        id: `nav-${item.href}`,
        title: item.title,
        href: item.href,
        breadcrumb: [...breadcrumb],
        type,
        score: 0,
        category,
        tags,
        isNew: item.title.toLowerCase().includes('new') || tags.includes('New'),
        lastUpdated: new Date() // In real app, this would come from the content
      });
    }
    
    // Recursively process children
    if (item.items && item.items.length > 0) {
      const newBreadcrumb = item.href && item.href !== '#' 
        ? [...breadcrumb, item.title] 
        : breadcrumb;
      results.push(...flattenNavigation(item.items, newBreadcrumb));
    }
  }
  
  return results;
}

// Enhanced search scoring algorithm
function scoreResult(result: SearchResult, query: string): number {
  const searchTerm = query.toLowerCase();
  let score = 0;
  
  // Title scoring (highest priority)
  const titleLower = result.title.toLowerCase();
  if (titleLower === searchTerm) score += 1000;
  else if (titleLower.startsWith(searchTerm)) score += 800;
  else if (titleLower.includes(searchTerm)) score += 500;
  
  // Breadcrumb scoring
  const breadcrumbText = result.breadcrumb.join(' ').toLowerCase();
  if (breadcrumbText.includes(searchTerm)) score += 200;
  
  // Description scoring
  if (result.description?.toLowerCase().includes(searchTerm)) score += 150;
  
  // Tag scoring
  if (result.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) score += 300;
  
  // Category scoring
  if (result.category.toLowerCase().includes(searchTerm)) score += 100;
  
  // Type-based scoring boosts
  if (result.type === 'api') score += 50;
  if (result.type === 'guide') score += 30;
  if (result.isNew) score += 25;
  
  return score;
}

export function ProfessionalSearchDialog({ 
  navigationItems, 
  onNavigate, 
  placeholder = "Search documentation...",
  className 
}: ProfessionalSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Flatten navigation items for searching
  const flatResults = useMemo(() => flattenNavigation(navigationItems), [navigationItems]);
  
  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All', icon: Search },
    { value: 'api', label: 'API', icon: Hash },
    { value: 'guide', label: 'Guides', icon: BookOpen },
    { value: 'page', label: 'Pages', icon: FileText },
  ];
  
  // Perform search with debouncing
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    const startTime = Date.now();
    
    // Simulate search delay for better UX
    await new Promise(resolve => setTimeout(resolve, 150));
    
    let results = flatResults
      .map(result => ({
        ...result,
        score: scoreResult(result, searchQuery)
      }))
      .filter(result => result.score > 0);
    
    // Apply filter
    if (selectedFilter !== 'all') {
      results = results.filter(result => result.type === selectedFilter);
    }
    
    // Sort by score and limit results
    results = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    
    const endTime = Date.now();
    setSearchTime(endTime - startTime);
    setSearchResults(results);
    setIsSearching(false);
    setSelectedIndex(0);
  }, [flatResults, selectedFilter]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [query, performSearch]);
  
  // Handle dialog open/close
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Dialog navigation
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
  
  // Auto-scroll selected item into view
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
  
  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'api':
        return <Hash className="h-4 w-4 text-blue-500" />;
      case 'guide':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'example':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'section':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const renderBreadcrumb = (breadcrumb: string[]) => {
    if (breadcrumb.length === 0) return null;
    
    return (
      <div className="flex items-center text-xs text-muted-foreground mb-1">
        {breadcrumb.map((crumb, index) => (
          <React.Fragment key={index}>
            <span className="truncate max-w-[100px]" title={crumb}>
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
        <mark key={index} className="bg-yellow-100 dark:bg-yellow-900/50 text-foreground font-semibold rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "relative h-9 w-full justify-start rounded-lg text-sm text-muted-foreground",
            "sm:pr-12 md:w-40 lg:w-64 xl:w-80",
            "hover:bg-accent/50 hover:text-foreground",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "transition-all duration-200 ease-in-out",
            "border-2 border-dashed border-muted-foreground/30 hover:border-primary/50",
            "group",
            className
          )}
          aria-label="Open search dialog"
        >
          <Search className="h-4 w-4 mr-2 shrink-0 group-hover:text-primary transition-colors" />
          <span className="hidden lg:inline-flex truncate">{placeholder}</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <Command className="h-3 w-3" />
              K
            </kbd>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-2xl max-h-[80vh] p-0 gap-0 overflow-hidden dialog-top-right"
        aria-describedby="search-dialog-description"
      >
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-background to-muted/20">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Smart Search
          </DialogTitle>
          <p id="search-dialog-description" className="text-sm text-muted-foreground mt-2">
            Find anything in the documentation quickly with intelligent search
          </p>
        </DialogHeader>
        
        {/* Search Input Section */}
        <div className="p-6 border-b bg-muted/5">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              ref={inputRef}
              type="search"
              placeholder="What are you looking for?"
              className="pl-10 pr-4 h-12 text-base bg-background border-2 focus:border-primary rounded-lg"
              value={query}
              onChange={handleInputChange}
              autoComplete="off"
              spellCheck="false"
              aria-label="Search documentation"
              aria-expanded={searchResults.length > 0}
              aria-activedescendant={searchResults[selectedIndex] ? `search-result-${selectedIndex}` : undefined}
              role="combobox"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              {filterOptions.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setSelectedFilter(filter.value)}
                >
                  <filter.icon className="h-3 w-3 mr-1" />
                  {filter.label}
                </Button>
              ))}
            </div>
            {searchResults.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {searchResults.length} results in {searchTime}ms
              </Badge>
            )}
          </div>
        </div>
        
        {/* Results Section */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div ref={resultsRef} className="p-4">
            {/* Loading State */}
            {isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              </motion.div>
            )}
            
            {/* No Query State */}
            {!query.trim() && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Recent Searches */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setQuery(search)}
                      >
                        <Clock className="h-3 w-3 mr-2" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Popular Content */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular Content
                  </h3>
                  <div className="space-y-2">
                    {popularContent.map((item, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between h-8 text-xs"
                        onClick={() => handleNavigate(item.href)}
                      >
                        <div className="flex items-center gap-2">
                          {getResultIcon(item.type)}
                          {item.title}
                        </div>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Search Results */}
            {query.trim() && !isSearching && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
                role="listbox"
                aria-label="Search results"
              >
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    id={`search-result-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group relative rounded-lg border p-4 cursor-pointer transition-all duration-200",
                      "hover:bg-accent/50 hover:border-primary/50 hover:shadow-md",
                      selectedIndex === index && "bg-accent border-primary shadow-md"
                    )}
                    onClick={() => handleNavigate(result.href)}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {/* Breadcrumb */}
                    {renderBreadcrumb(result.breadcrumb)}
                    
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {highlightMatch(result.title, query)}
                          </h4>
                          {result.isNew && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        {result.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {highlightMatch(result.description, query)}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                          
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* No Results */}
            {query.trim() && !isSearching && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-muted-foreground py-12"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-base mb-2">No results found</h3>
                <p className="text-sm mb-4">
                  Try searching with different keywords or check your spelling
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery('')}
                >
                  Clear search
                </Button>
              </motion.div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <Sparkles className="h-3 w-3" />
              <span className="font-medium">Smart Search</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}