"use server";

import { intelligentSearch, type IntelligentSearchInput, type IntelligentSearchOutput } from '@/ai/flows/intelligent-search';
import { getAllDocumentationContent } from '@/lib/docs';
import { navigationConfig } from '@/config/navigation';

interface SearchState {
  results: string[];
  error?: string;
  query?: string;
  isLoading?: boolean;
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

export async function performSearch(prevState: SearchState | undefined, formData: FormData): Promise<SearchState> {
  const query = formData.get('query')?.toString().toLowerCase();

  if (!query || query.trim().length < 2) {
    return { results: [], error: "Please enter a search term (at least 2 characters).", query, isLoading: false };
  }

  try {
    // First, search in navigation
    const flatNav = flattenNavigation(navigationConfig);
    const navResults = flatNav
      .filter(item => item.title.toLowerCase().includes(query))
      .map(item => `[${item.title}](${item.path})`);

    // If we have navigation results, return them
    if (navResults.length > 0) {
      return {
        results: navResults,
        query,
        isLoading: false
      };
    }

    // If no navigation results, try intelligent search
    const documentationContent = await getAllDocumentationContent();
    const searchInput: IntelligentSearchInput = {
      query,
      documentationContent,
    };

    const searchOutput: IntelligentSearchOutput = await intelligentSearch(searchInput);

    if (!searchOutput || !searchOutput.results) {
      return { results: [], error: "Search did not return any results.", query, isLoading: false };
    }

    const filteredResults = searchOutput.results.filter(result => result && result.trim().length > 10);

    if (filteredResults.length === 0) {
      return { results: [], error: `No relevant results found for "${query}". Try different keywords.`, query, isLoading: false };
    }

    return { results: filteredResults, query, isLoading: false };

  } catch (error: any) {
    console.error("Search error:", error);
    return {
      results: [],
      query,
      error: error.message || "An unexpected error occurred during search.",
      isLoading: false
    };
  }
}

