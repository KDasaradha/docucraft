// src/ai/flows/enhanced-search.ts
'use server';
/**
 * @fileOverview Enhanced intelligent search functionality using Genkit with better result processing.
 *
 * - enhancedIntelligentSearch - A function that performs advanced search with relevance scoring and snippets.
 * - EnhancedSearchInput - The input type for the enhancedIntelligentSearch function.
 * - EnhancedSearchOutput - The return type for the enhancedIntelligentSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancedSearchInputSchema = z.object({
  query: z.string().describe('The search query string.'),
  documentationContent: z.string().describe('The entire documentation content as a single string.'),
  maxResults: z.number().optional().default(10).describe('Maximum number of results to return.'),
  includeSnippets: z.boolean().optional().default(true).describe('Whether to include content snippets.'),
});
export type EnhancedSearchInput = z.infer<typeof EnhancedSearchInputSchema>;

const SearchResultSchema = z.object({
  content: z.string().describe('The relevant content snippet or full content.'),
  title: z.string().describe('The title of the documentation section.'),
  path: z.string().optional().describe('The path/URL to the documentation page.'),
  relevanceScore: z.number().min(0).max(1).describe('Relevance score between 0 and 1.'),
  snippet: z.string().optional().describe('A brief snippet highlighting the relevant content.'),
  type: z.enum(['navigation', 'content', 'ai-generated']).optional().default('content').describe('Type of search result.'),
});

const EnhancedSearchOutputSchema = z.object({
  results: z.array(SearchResultSchema).describe('An array of relevant documentation results with metadata.'),
  totalFound: z.number().optional().describe('Total number of results found.'),
  searchSummary: z.string().optional().describe('A brief summary of what was found.'),
});
export type EnhancedSearchOutput = z.infer<typeof EnhancedSearchOutputSchema>;

export async function enhancedIntelligentSearch(input: EnhancedSearchInput): Promise<EnhancedSearchOutput> {
  return enhancedSearchFlow(input);
}

const enhancedSearchPrompt = ai.definePrompt({
  name: 'enhancedSearchPrompt',
  input: {schema: EnhancedSearchInputSchema},
  output: {schema: EnhancedSearchOutputSchema},
  prompt: `You are an advanced search assistant for a comprehensive FastAPI and web development documentation website.

Your task is to analyze the user's query and find the most relevant content from the documentation.

SEARCH STRATEGY:
1. Look for exact matches first
2. Find semantically related content
3. Consider context and user intent
4. Provide diverse result types (tutorials, API references, examples)

RELEVANCE SCORING (0.0 to 1.0):
- 1.0: Perfect match (exact title/topic match)
- 0.8-0.9: Very relevant (covers main topic)
- 0.6-0.7: Relevant (related concepts)
- 0.4-0.5: Somewhat relevant (tangentially related)
- 0.0-0.3: Low relevance

RESULT TYPES:
- 'content': Main documentation content
- 'navigation': Navigation/menu items
- 'ai-generated': Synthesized explanations

For each result, provide:
- Accurate title from the documentation
- Relevant content snippet (prefer complete sections)
- Proper path/URL if identifiable from content
- Accurate relevance score
- Brief snippet for preview (50-150 words)

DOCUMENTATION CONTENT:
{{documentationContent}}

USER QUERY: {{query}}

Find up to {{maxResults}} most relevant results. Focus on practical, actionable content that directly addresses the user's needs.`, 
});

const enhancedSearchFlow = ai.defineFlow(
  {
    name: 'enhancedSearchFlow',
    inputSchema: EnhancedSearchInputSchema,
    outputSchema: EnhancedSearchOutputSchema,
  },
  async input => {
    try {
      const {output} = await enhancedSearchPrompt(input);
      
      if (!output || !output.results) {
        return {
          results: [],
          totalFound: 0,
          searchSummary: `No results found for "${input.query}"`
        };
      }

      // Post-process results to ensure quality
      const processedResults = output.results
        .filter(result => result.content && result.content.trim().length > 10)
        .map(result => ({
          ...result,
          // Ensure relevance score is within bounds
          relevanceScore: Math.max(0, Math.min(1, result.relevanceScore)),
          // Clean up content
          content: result.content.trim(),
          // Ensure snippet exists
          snippet: result.snippet || result.content.substring(0, 150) + (result.content.length > 150 ? '...' : ''),
          // Default path if not provided
          path: result.path || '#',
          // Ensure type is set
          type: result.type || 'content'
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
        .slice(0, input.maxResults); // Limit results

      return {
        results: processedResults,
        totalFound: processedResults.length,
        searchSummary: output.searchSummary || `Found ${processedResults.length} results for "${input.query}"`
      };
    } catch (error) {
      console.error('Enhanced search flow error:', error);
      return {
        results: [],
        totalFound: 0,
        searchSummary: `Search failed for "${input.query}"`
      };
    }
  }
);