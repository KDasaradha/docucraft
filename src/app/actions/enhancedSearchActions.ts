"use server";

import { enhancedIntelligentSearch, type EnhancedSearchInput, type EnhancedSearchOutput } from '@/ai/flows/enhanced-search';
import { getAllDocumentationContent } from '@/lib/docs';
import { navigationConfig } from '@/config/navigation';

interface SearchResult {
  content: string;
  title: string;
  path: string;
  relevanceScore: number;
  snippet: string;
  type: 'navigation' | 'content' | 'ai-generated';
}

interface EnhancedSearchState {
  results: SearchResult[];
  error?: string;
  query?: string;
  isLoading?: boolean;
  searchTime?: number;
  totalResults?: number;
}

function flattenNavigation(items: typeof navigationConfig): Array<{ title: string; path: string }> {
  return items.reduce((acc, item) => {
    if (item.path) {
      acc.push({ title: item.title, path: item.path });
    }
    if (item.children) {
      acc.push(...flattenNavigation(item.children));
    }
    return acc;
  }, [] as Array<{ title: string; path: string }>);
}

function calculateRelevanceScore(query: string, title: string, content: string): number {
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  let score = 0;
  
  // Exact title match gets highest score
  if (titleLower === queryLower) score += 1.0;
  else if (titleLower.includes(queryLower)) score += 0.8;
  
  // Title word matches
  const queryWords = queryLower.split(/\s+/);
  const titleWords = titleLower.split(/\s+/);
  const titleMatches = queryWords.filter(word => titleWords.some(titleWord => titleWord.includes(word)));
  score += (titleMatches.length / queryWords.length) * 0.6;
  
  // Content matches (less weight)
  const contentMatches = queryWords.filter(word => contentLower.includes(word));
  score += (contentMatches.length / queryWords.length) * 0.3;
  
  return Math.min(score, 1.0);
}

function extractSnippet(content: string, query: string, maxLength: number = 200): string {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Find the first occurrence of any query word
  const queryWords = queryLower.split(/\s+/);
  let bestIndex = -1;
  let bestWord = '';
  
  for (const word of queryWords) {
    const index = contentLower.indexOf(word);
    if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
      bestIndex = index;
      bestWord = word;
    }
  }
  
  if (bestIndex === -1) {
    // No match found, return beginning of content
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }
  
  // Extract snippet around the match
  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(content.length, start + maxLength);
  
  let snippet = content.substring(start, end);
  
  // Add ellipsis if needed
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}

export async function performEnhancedSearch(
  prevState: EnhancedSearchState | undefined, 
  formData: FormData
): Promise<EnhancedSearchState> {
  const startTime = Date.now();
  const query = formData.get('query')?.toString().trim();

  if (!query || query.length < 2) {
    return { 
      results: [], 
      error: "Please enter a search term (at least 2 characters).", 
      query, 
      isLoading: false,
      searchTime: 0,
      totalResults: 0
    };
  }

  try {
    const results: SearchResult[] = [];
    
    // 1. Search in navigation first (fast results)
    const flatNav = flattenNavigation(navigationConfig);
    const navResults = flatNav
      .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
      .map(item => ({
        content: '',
        title: item.title,
        path: item.path,
        relevanceScore: calculateRelevanceScore(query, item.title, ''),
        snippet: `Navigate to ${item.title}`,
        type: 'navigation' as const
      }))
      .slice(0, 3); // Limit navigation results
    
    results.push(...navResults);

    // 2. Get all documentation content for AI search
    const documentationContent = await getAllDocumentationContent();
    
    // 3. Perform AI-enhanced search
    const searchInput: EnhancedSearchInput = {
      query,
      documentationContent,
      maxResults: 8,
      includeSnippets: true,
    };

    const searchOutput: EnhancedSearchOutput = await enhancedIntelligentSearch(searchInput);

    if (searchOutput && searchOutput.results) {
      // Process AI results
      const aiResults = searchOutput.results
        .filter(result => result && result.content && result.content.trim().length > 20)
        .map(result => {
          // Extract path from content if it contains markdown links
          let path = result.path || '#';
          const linkMatch = result.content.match(/\[.*?\]\((.*?)\)/);
          if (linkMatch && linkMatch[1]) {
            path = linkMatch[1];
          }
          
          // Clean content for snippet extraction
          const cleanContent = result.content.replace(/\[.*?\]\(.*?\)/g, '').trim();
          
          return {
            content: result.content,
            title: result.title || 'Documentation',
            path,
            relevanceScore: result.relevanceScore || calculateRelevanceScore(query, result.title || '', cleanContent),
            snippet: result.snippet || extractSnippet(cleanContent, query),
            type: (result.type || 'ai-generated') as 'navigation' | 'content' | 'ai-generated'
          };
        });

      results.push(...aiResults);
    }

    // 4. Remove duplicates and sort by relevance
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.path === result.path)
    );

    uniqueResults.sort((a, b) => {
      // Prioritize navigation results, then by relevance score
      if (a.type === 'navigation' && b.type !== 'navigation') return -1;
      if (b.type === 'navigation' && a.type !== 'navigation') return 1;
      return b.relevanceScore - a.relevanceScore;
    });

    const searchTime = Date.now() - startTime;

    if (uniqueResults.length === 0) {
      return { 
        results: [], 
        error: `No relevant results found for "${query}". Try different keywords or check spelling.`, 
        query, 
        isLoading: false,
        searchTime,
        totalResults: 0
      };
    }

    return { 
      results: uniqueResults.slice(0, 10), // Limit to top 10 results
      query, 
      isLoading: false,
      searchTime,
      totalResults: uniqueResults.length
    };

  } catch (error: any) {
    console.error("Enhanced search error:", error);
    const searchTime = Date.now() - startTime;
    
    return {
      results: [],
      query,
      error: error.message || "An unexpected error occurred during search. Please try again.",
      isLoading: false,
      searchTime,
      totalResults: 0
    };
  }
}