"use server";

import { intelligentSearch, type IntelligentSearchInput, type IntelligentSearchOutput } from '@/ai/flows/intelligent-search';
import { getAllDocumentationContent } from '@/lib/docs';

interface SearchState {
  results: string[];
  error?: string;
  query?: string;
  isLoading?: boolean;
}

export async function performSearch(prevState: SearchState | undefined, formData: FormData): Promise<SearchState> {
  const query = formData.get("query") as string;

  if (!query || query.trim().length < 2) {
    return { results: [], error: "Please enter a search term (at least 2 characters).", query, isLoading: false };
  }

  try {
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

    if (filteredResults.length === 0 && query.length > 0) { 
        return { results: [], error: `No relevant results found for "${query}". Try different keywords.`, query, isLoading: false };
    }

    return { results: filteredResults, query, isLoading: false };

  } catch (e: any) {
    console.error("Search error:", e);
    return { results: [], error: e.message || "An unexpected error occurred during search.", query, isLoading: false };
  }
}
