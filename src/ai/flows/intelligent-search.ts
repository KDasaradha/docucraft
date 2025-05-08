// src/ai/flows/intelligent-search.ts
'use server';
/**
 * @fileOverview Implements the intelligent search functionality using Genkit.
 *
 * - intelligentSearch - A function that performs the search and returns relevant documentation content.
 * - IntelligentSearchInput - The input type for the intelligentSearch function.
 * - IntelligentSearchOutput - The return type for the intelligentSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentSearchInputSchema = z.object({
  query: z.string().describe('The search query string.'),
  documentationContent: z.string().describe('The entire documentation content as a single string.'),
});
export type IntelligentSearchInput = z.infer<typeof IntelligentSearchInputSchema>;

const IntelligentSearchOutputSchema = z.object({
  results: z.array(z.string()).describe('An array of relevant documentation snippets.'),
});
export type IntelligentSearchOutput = z.infer<typeof IntelligentSearchOutputSchema>;

export async function intelligentSearch(input: IntelligentSearchInput): Promise<IntelligentSearchOutput> {
  return intelligentSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentSearchPrompt',
  input: {schema: IntelligentSearchInputSchema},
  output: {schema: IntelligentSearchOutputSchema},
  prompt: `You are a search assistant for a documentation website.
  Your goal is to find relevant snippets from the documentation content that match the user's query.
  Return an array of strings, where each string is a snippet from the documentation.

  Consider the following documentation content:
  {{documentationContent}}

  User query: {{query}}
  `, 
});

const intelligentSearchFlow = ai.defineFlow(
  {
    name: 'intelligentSearchFlow',
    inputSchema: IntelligentSearchInputSchema,
    outputSchema: IntelligentSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
