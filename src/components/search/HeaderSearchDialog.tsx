"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Search, Loader2, AlertCircle, FileText, X, Clock, Sparkles } from "lucide-react";
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
    <Button type="submit" disabled={isDisabled} className="gap-2 shrink-0 sm:w-auto w-full">
      {isDisabled ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="h-4 w-4" />
          Search
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
  
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalQuery(''); 
      formRef.current?.reset();
      setRecentSearches(getRecentSearches());
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Global keyboard shortcut and outside click handling
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape" && isOpen) {
         e.preventDefault();
         setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const handleRecentSearchClick = (query: string) => {
    setLocalQuery(query);
    inputRef.current?.focus();
  };

  const handleFormSubmit = async (formData: FormData) => {
    const query = formData.get('query')?.toString();
    if (query?.trim()) {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
      
      // Set loading state
      setFormState(prev => ({ ...prev, isLoading: true, query: query.trim() }));
      
      startTransition(async () => {
        try {
          const result = await performEnhancedSearch(formState, formData);
          setFormState(result);
        } catch (error) {
          setFormState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An error occurred during search'
          }));
        }
      });
    }
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'content':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'ai-generated':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  const getResultTypeBadge = (type: string) => {
    switch (type) {
      case 'navigation':
        return <Badge variant="secondary" className="text-xs">Navigation</Badge>;
      case 'content':
        return <Badge variant="default" className="text-xs">Content</Badge>;
      case 'ai-generated':
        return <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">AI</Badge>;
      default:
        return null;
    }
  };

  const getResultsContent = () => {
    const isSearchPending = formState?.isLoading || isPending;
    
    if (isSearchPending && localQuery) {
      return (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
            <p className="font-medium">Searching documentation...</p>
            <p className="text-sm">Finding the best results for &quot;{localQuery}&quot;</p>
          </div>
        </div>
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
              {formState.totalResults || formState.results.length} result{(formState.totalResults || formState.results.length) !== 1 ? 's' : ''} found
            </span>
            {formState.searchTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formState.searchTime}ms
              </span>
            )}
          </div>

          <div className="space-y-4">
            {formState.results.map((result, index) => (
              <motion.div
                key={`${result.path}-${index}`}
                className="p-4 border rounded-lg shadow-sm bg-card hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer hover:border-primary/50 group"
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                onClick={() => {
                  window.location.href = result.path;
                  setIsOpen(false);
                }}
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
          <p className="text-sm mb-4">We couldn&apos;t find anything matching &quot;{formState.query}&quot;</p>
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
            <h3 className="text-sm text-muted-foreground font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h3>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left p-2 rounded-md hover:text-primary hover:underline cursor-pointer hover:bg-accent/50 transition-all duration-200 ease-in-out text-sm flex items-center gap-2"
                >
                  <Search className="h-3 w-3 text-muted-foreground" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-muted-foreground py-8">
          <div className="mb-4">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/70" />
          </div>
          <p className="font-medium text-lg mb-2">Enhanced Documentation Search</p>
          <p className="text-sm mb-4">Powered by AI for better results</p>
          <div className="text-xs space-y-1 max-w-md mx-auto">
            <p>• Search through all documentation content</p>
            <p>• Get AI-powered relevant snippets</p>
            <p>• Find exact matches and related topics</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative h-9 w-full justify-start rounded-md text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 hover:bg-accent/50 focus:ring-2 focus:ring-ring">
          <Search className="h-4 w-4 mr-2 shrink-0" />
          <span className="hidden lg:inline-flex truncate">Search documentation...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-xl w-full max-h-[calc(100vh-8rem)] p-6 rounded-lg shadow-xl flex flex-col gap-4 bg-white"
        aria-describedby="search-dialog-description"
      >
        <DialogHeader className="p-6 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Enhanced Search
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => setIsOpen(false)}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p id="search-dialog-description" className="sr-only">
            Search through documentation content using AI-powered search. Use keyboard shortcuts to navigate and interact with results.
          </p>
        </DialogHeader>
        
        <form action={handleFormSubmit} ref={formRef} className="p-6 border-b sticky top-[calc(var(--dialog-header-height,80px))] bg-background z-10">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 w-full items-stretch sm:items-center">
            <div className="flex-1 flex items-center bg-muted/50 rounded-lg focus-within:ring-2 focus-within:ring-primary transition-all duration-200 ease-in-out">
              <Search className="h-5 w-5 text-muted-foreground shrink-0 ml-4 mr-3" />
              <Input
                ref={inputRef}
                type="search"
                name="query"
                placeholder="Search documentation, examples, or ask a question..."
                className="flex-1 h-12 border-0 shadow-none focus-visible:ring-0 text-base w-full bg-transparent px-4 py-2"
                value={localQuery}
                onChange={handleInputChange}
                autoComplete="off"
                spellCheck="false"
                aria-label="Search"
              />
            </div>
            <SubmitButton isLoading={formState?.isLoading || isPending} />
          </div>
        </form>
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 min-h-[300px]"> 
            {getResultsContent()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}