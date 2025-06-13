import React from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Code, Sparkles } from 'lucide-react';
import { AIFeaturesShowcase, EnhancedCodeBlock, CodeExplanationButton } from '@/components/ai';

export const metadata: Metadata = {
  title: 'AI Features Demo - DocuCraft',
  description: 'Interactive demonstration of AI-powered documentation features including code explanation, analysis, and intelligent assistance.',
};

const sampleCode = {
  python: `@app.post("/users/", response_model=User)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user in the database.
    
    Args:
        user: User data for creation
        db: Database session dependency
        
    Returns:
        User: The created user object
        
    Raises:
        HTTPException: If user creation fails
    """
    try:
        # Check if user already exists
        existing_user = await user_service.get_user_by_email(db, user.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user.password)
        user_data = user.dict()
        user_data["hashed_password"] = hashed_password
        del user_data["password"]
        
        # Create user in database
        new_user = await user_service.create_user(db, user_data)
        
        # Send welcome email (async)
        await send_welcome_email.delay(new_user.email, new_user.first_name)
        
        return new_user
        
    except Exception as e:
        logger.error(f"User creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")`,

  typescript: `import { useCallback, useState, useEffect } from 'react';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
}

export function useAdvancedSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: searchQuery,
            options: {
              fuzzy: true,
              semantic: true,
              maxResults: 20
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search error');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearResults: () => setResults([])
  };
}`,

  javascript: `// Advanced caching mechanism with TTL and memory management
class AdvancedCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.timers = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes
    this.onEvict = options.onEvict || (() => {});
  }

  set(key, value, ttl = this.defaultTTL) {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Clear existing timer if key exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value with metadata
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    });

    // Set TTL timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }

    return this;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // Update access metadata
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.value;
  }

  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < lruTime) {
        lruTime = item.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      this.onEvict(key, item.value);
      this.cache.delete(key);
    }
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    return this;
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
    return this;
  }

  getStats() {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalAccesses: items.reduce((sum, item) => sum + item.accessCount, 0),
      averageAge: items.length > 0 
        ? items.reduce((sum, item) => sum + (Date.now() - item.timestamp), 0) / items.length
        : 0
    };
  }
}`
};

export default function AIDemoPage() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI Features Demo
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the power of AI-driven code analysis and documentation assistance. 
          Try the features below to see how AI can enhance your development workflow.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Google AI Powered</span>
          </div>
          <div className="flex items-center gap-1">
            <Code className="h-4 w-4" />
            <span>Real-time Analysis</span>
          </div>
        </div>
      </div>

      {/* Code Explanation Demo */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Code Explanation & Analysis</h2>
          <p className="text-muted-foreground">
            Click the "Explain" button on any code block to get detailed AI-powered analysis
          </p>
        </div>

        <div className="grid gap-6">
          {/* Python FastAPI Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    FastAPI User Creation Endpoint
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Complex async endpoint with error handling, validation, and background tasks
                  </CardDescription>
                </div>
                <Badge variant="secondary">Advanced</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedCodeBlock
                code={sampleCode.python}
                language="python"
                title="FastAPI User Creation"
                filename="app/routes/users.py"
                showLineNumbers={true}
                highlightLines={[10, 11, 12, 21, 22]}
              />
            </CardContent>
          </Card>

          {/* TypeScript React Hook Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Advanced React Search Hook
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Custom hook with debouncing, error handling, and semantic search
                  </CardDescription>
                </div>
                <Badge variant="secondary">Intermediate</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedCodeBlock
                code={sampleCode.typescript}
                language="typescript"
                title="Advanced Search Hook"
                filename="hooks/useAdvancedSearch.ts"
                showLineNumbers={true}
                highlightLines={[18, 19, 20]}
              />
            </CardContent>
          </Card>

          {/* JavaScript Caching System Example */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Advanced Caching System
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Memory-efficient cache with TTL, LRU eviction, and statistics
                  </CardDescription>
                </div>
                <Badge variant="secondary">Expert</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedCodeBlock
                code={sampleCode.javascript}
                language="javascript"
                title="Advanced Cache Implementation"
                filename="utils/AdvancedCache.js"
                showLineNumbers={true}
                highlightLines={[7, 8, 9, 43, 44, 45]}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Standalone Code Explanation Buttons */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Quick Code Analysis</h2>
          <p className="text-muted-foreground">
            Use standalone buttons for quick code explanations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Analysis</CardTitle>
              <CardDescription>High-level overview and main concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 p-3 rounded mb-4 text-sm">
                <code>{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}</code>
              </pre>
              <CodeExplanationButton
                code="function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}"
                language="javascript"
                explainLevel="basic"
                context="Simple recursive fibonacci function"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Analysis</CardTitle>
              <CardDescription>Line-by-line explanation with context</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 p-3 rounded mb-4 text-sm">
                <code>{`const memoFib = (n, memo = {}) => {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  memo[n] = memoFib(n - 1, memo) + memoFib(n - 2, memo);
  return memo[n];
};`}</code>
              </pre>
              <CodeExplanationButton
                code="const memoFib = (n, memo = {}) => {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  memo[n] = memoFib(n - 1, memo) + memoFib(n - 2, memo);\n  return memo[n];\n};"
                language="javascript"
                explainLevel="detailed"
                focusAreas={['functionality', 'performance', 'patterns']}
                context="Optimized fibonacci with memoization"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expert Analysis</CardTitle>
              <CardDescription>Deep dive into algorithms and optimizations</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/50 p-3 rounded mb-4 text-sm">
                <code>{`class FibonacciCache {
  constructor() {
    this.cache = new Map([[0, 0], [1, 1]]);
  }
  
  compute(n) {
    if (!this.cache.has(n)) {
      this.cache.set(n, this.compute(n - 1) + this.compute(n - 2));
    }
    return this.cache.get(n);
  }
}`}</code>
              </pre>
              <CodeExplanationButton
                code="class FibonacciCache {\n  constructor() {\n    this.cache = new Map([[0, 0], [1, 1]]);\n  }\n  \n  compute(n) {\n    if (!this.cache.has(n)) {\n      this.cache.set(n, this.compute(n - 1) + this.compute(n - 2));\n    }\n    return this.cache.get(n);\n  }\n}"
                language="javascript"
                explainLevel="expert"
                focusAreas={['performance', 'patterns', 'optimization']}
                context="Object-oriented fibonacci implementation"
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8" />

      {/* All AI Features Showcase */}
      <section>
        <AIFeaturesShowcase />
      </section>
    </div>
  );
}