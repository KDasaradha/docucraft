"use client";

import React, { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { Search, Loader2, AlertCircle, FileText, X, Clock, Sparkles, Command, ArrowRight, TrendingUp } from "lucide-react";
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
import { performEnhancedSearch } from "@/app/actions/enhancedSearchActions";
import MarkdownRenderer from "@/components/docs/MarkdownRenderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const initialState: { 
  results: Array<{
    content: string;
    title: string;
    path: string;
    relevanceScore: number;
    snippet: string;
    type: 'navigation' | 'content' | 'ai-generated';
  }>; 
  error?: string; 
  query?: string;
  isLoading?: boolean;
  searchTime?: number;
  totalResults?: number;
} = {
  results: [],
  error: undefined,
  query: undefined,
  isLoading: false,
  searchTime: 0,
  totalResults: 0,
};

function SubmitButton({ isLoading }: { isLoading?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || isLoading;
  
  return (
    <Button 
      type="submit" 
      disabled={isDisabled} 
      size="sm"
      className="gap-2 shrink-0 px-3 py-1.5 h-8"
    >
      {isDisabled ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span className="text-xs">Searching...</span>
        </>
      ) : (
        <>
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search</span>
        </>
      )}
    </Button>
  );
}

// Recent searches storage
const RECENT_SEARCHES_KEY = 'docucraft-recent-searches';
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

export function HeaderSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState(initialState);
  const [localQuery, setLocalQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mount check for hydration
  useEffect(() => {
    setIsMounted(true);
    setRecentSearches(getRecentSearches());
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && isMounted) {
      setLocalQuery('');
      setFormState(initialState);
      setSelectedIndex(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMounted]);

  // Handle keyboard shortcuts
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

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            const maxIndex = (formState.results?.length || 0) + recentSearches.length - 1;
            return prev < maxIndex ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => {
            const maxIndex = (formState.results?.length || 0) + recentSearches.length - 1;
            return prev > 0 ? prev - 1 : maxIndex;
          });
          break;
        case 'Enter':
          e.preventDefault();
          handleEnterKey();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, formState.results, recentSearches]);

  const handleEnterKey = () => {
    if (selectedIndex >= 0) {
      if (formState.results && selectedIndex < formState.results.length) {
        // Navigate to selected result
        const result = formState.results[selectedIndex];
        window.location.href = result.path;
        setIsOpen(false);
      } else {
        // Handle recent search selection
        const recentIndex = selectedIndex - (formState.results?.length || 0);
        if (recentIndex >= 0 && recentIndex < recentSearches.length) {
          handleRecentSearchClick(recentSearches[recentIndex]);
        }
      }
    } else if (localQuery.trim()) {
      // Submit current query
      const formData = new FormData();
      formData.append('query', localQuery);
      handleSubmit(formData);
    }
  };

  const handleSubmit = useCallback(async (formData: FormData) => {
    const query = formData.get('query')?.toString() || '';
    if (!query.trim()) return;

    setLocalQuery(query);
    addRecentSearch(query);
    setRecentSearches(getRecentSearches());

    startTransition(async () => {
      try {
        const result = await performEnhancedSearch(formState, formData);
        setFormState(result);
        setSelectedIndex(-1); // Reset selection after search
      } catch (error) {
        setFormState({
          ...formState,
          error: 'Search failed. Please try again.',
          isLoading: false
        });
      }
    });
  }, [formState]);

  const handleRecentSearchClick = useCallback((search: string) => {
    setLocalQuery(search);
    const formData = new FormData();
    formData.append('query', search);
    handleSubmit(formData);
  }, [handleSubmit]);

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'content':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'ai-generated':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResultTypeBadge = (type: string) => {
    switch (type) {
      case 'navigation':
        return <Badge variant="secondary" className="text-xs">Navigation</Badge>;
      case 'content':
        return <Badge variant="default" className="text-xs">Content</Badge>;
      case 'ai-generated':
        return <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">AI</Badge>;
      default:
        return null;
    }
  };

  const getResultsContent = () => {
    const isSearchPending = formState?.isLoading || isPending;
    
    if (isSearchPending && localQuery) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-12 text-muted-foreground"
        >
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 mx-auto text-primary" />
            </motion.div>
            <div className="space-y-2">
              <motion.p 
                className="font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Searching documentation...
              </motion.p>
              <motion.p 
                className="text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Finding the best results for "{localQuery}"
              </motion.p>
            </div>
            {/* Loading skeleton */}
            <motion.div 
              className="space-y-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      );
    }

    if (formState?.error && formState.query === localQuery && localQuery !== "") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Search Error</AlertTitle>
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    if (formState?.results && formState.results.length > 0 && formState.query === localQuery && localQuery !== "") {
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          {/* Search stats */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <span>
              {formState.results.length} result{formState.results.length !== 1 ? 's' : ''} found
            </span>
            {formState.searchTime && (
              <span>
                {formState.searchTime}ms
              </span>
            )}
          </div>

          <div className="space-y-3" ref={resultsRef}>
            {formState.results.map((result, index) => (
              <motion.div
                key={`${result.path}-${index}`}
                className={cn(
                  "p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer hover:border-primary/50 group",
                  selectedIndex === index && "ring-2 ring-primary bg-accent"
                )}
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                onClick={() => {
                  window.location.href = result.path;
                  setIsOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getResultTypeIcon(result.type)}
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {result.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getResultTypeBadge(result.type)}
                    {result.relevanceScore && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(result.relevanceScore * 100)}% match
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2 font-mono">
                  {result.path}
                </div>
                
                {result.snippet && (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {result.snippet}
                  </div>
                )}
                
                {result.content && result.type !== 'navigation' && (
                  <div className="mt-3 border-t pt-3">
                    <MarkdownRenderer 
                      content={result.content} 
                      className="text-sm prose-sm dark:prose-invert max-w-full prose-p:my-1 prose-headings:my-1 line-clamp-3" 
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (formState?.query === localQuery && formState.results && formState.results.length === 0 && !formState.error && localQuery !== "" && !isSearchPending) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="text-center text-muted-foreground py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/70" />
          <p className="font-medium text-lg mb-2">No results found</p>
          <p className="text-sm mb-4">We couldn't find anything matching "{formState.query}"</p>
          <div className="text-xs space-y-1">
            <p>• Try using different or more general keywords</p>
            <p>• Check for typos in your search terms</p>
            <p>• Use fewer words in your search</p>
          </div>
        </motion.div>
      );
    }

    // Initial state - show recent searches and suggestions
    return (
      <div className="space-y-6">
        {recentSearches.length > 0 && (
          <div>
            <h3 className="text-sm text-muted-foreground font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h3>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleRecentSearchClick(search)}
                  className={cn(
                    "w-full text-left p-3 rounded-md hover:text-primary hover:bg-accent/50 transition-all duration-200 ease-in-out text-sm flex items-center gap-3",
                    selectedIndex === (formState.results?.length || 0) + index && "bg-accent ring-2 ring-primary"
                  )}
                  onMouseEnter={() => setSelectedIndex((formState.results?.length || 0) + index)}
                >
                  <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{search}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div className="text-center text-muted-foreground py-8">
          <motion.div 
            className="mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary/70" />
          </motion.div>
          <motion.p 
            className="font-medium text-lg mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Enhanced Documentation Search
          </motion.p>
          <motion.p 
            className="text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Powered by AI for better results
          </motion.p>
          <motion.div 
            className="text-xs space-y-1 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>• Search through all documentation content</p>
            <p>• Get AI-powered suggestions and summaries</p>
            <p>• Find relevant code examples and guides</p>
          </motion.div>
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-2 opacity-50" disabled>
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[80vh] overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Documentation
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b">
          <form ref={formRef} action={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                name="query"
                type="search"
                placeholder="Search documentation..."
                className="w-full pr-10"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
              {localQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setLocalQuery('');
                    setFormState(initialState);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <SubmitButton isLoading={isPending} />
          </form>
        </div>
        
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4">
            {getResultsContent()}
          </div>
        </ScrollArea>
        
        {/* Keyboard shortcuts hint */}
        <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>⎋ Close</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Enhanced Search</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}