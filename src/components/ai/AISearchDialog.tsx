'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Brain,
  Sparkles,
  FileText,
  ExternalLink,
  Loader2,
  Zap,
  Target,
  Info,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  content: string;
  title: string;
  path?: string;
  relevanceScore: number;
  snippet?: string;
  type: 'navigation' | 'content' | 'ai-generated';
}

interface SearchResponse {
  results: SearchResult[];
  totalFound?: number;
  searchSummary?: string;
}

interface AISearchDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function AISearchDialog({ trigger, className }: AISearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState<string>('');
  const [totalFound, setTotalFound] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSearchSummary('');
    setTotalFound(0);

    try {
      const response = await fetch('/api/ai/enhanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          documentationContent: 'DocuCraft comprehensive documentation content',
          maxResults: 15,
          includeSnippets: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      setResults(data.results || []);
      setSearchSummary(data.searchSummary || '');
      setTotalFound(data.totalFound || data.results?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      window.location.href = result.path;
      setIsOpen(false);
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'navigation': return <Target className="h-3 w-3" />;
      case 'ai-generated': return <Brain className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const defaultTrigger = (
    <Button size="lg" className={`gap-2 ${className}`}>
      <Brain className="h-4 w-4" />
      Try AI Search
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="ai-dialog-content sm:max-w-4xl max-h-[85vh] flex flex-col p-0 m-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">AI-Powered Search</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Sparkles className="h-3 w-3" />
                Semantic search with intelligent context understanding
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search with natural language... (e.g., 'JWT authentication setup')"
                disabled={isLoading}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Search Error</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Analyzing your query with AI...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Searching for: "{query}"
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !error && results.length === 0 && query && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or using different keywords.
                </p>
              </div>
            )}

            {!isLoading && !error && !query && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">AI-Powered Search</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Use natural language to find exactly what you're looking for. 
                  Try queries like "how to implement authentication" or "best practices for error handling".
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  {[
                    'JWT authentication setup',
                    'Error handling best practices',
                    'Database connection patterns',
                    'API documentation guidelines'
                  ].map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setQuery(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-6">
                {searchSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-sm mb-1">AI Summary</p>
                            <p className="text-sm text-muted-foreground">{searchSummary}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Found {totalFound} result{totalFound !== 1 ? 's' : ''} for "{query}"
                  </h3>
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    AI Enhanced
                  </Badge>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {results.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
                          onClick={() => handleResultClick(result)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getTypeIcon(result.type)}
                                  <CardTitle className="text-base hover:text-primary transition-colors">
                                    {result.title}
                                  </CardTitle>
                                  {result.path && (
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getRelevanceColor(result.relevanceScore)}`}
                                  >
                                    {Math.round(result.relevanceScore * 100)}% match
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {result.type.replace('-', ' ')}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {result.snippet && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {result.snippet}
                              </p>
                            )}
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                              {result.content.substring(0, 200)}
                              {result.content.length > 200 && '...'}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}