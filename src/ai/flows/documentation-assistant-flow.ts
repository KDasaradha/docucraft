'use server';
/**
 * @fileOverview AI Documentation Assistant - Interactive Q&A for documentation
 * 
 * Provides intelligent answers to user questions based on documentation content,
 * with context awareness and follow-up question suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentationAssistantInputSchema = z.object({
  question: z.string().describe('The user\'s question about the documentation.'),
  documentationContext: z.string().describe('Relevant documentation content for context.'),
  conversationHistory: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional().describe('Previous conversation history for context.'),
  userLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate').describe('User\'s technical level.'),
});
export type DocumentationAssistantInput = z.infer<typeof DocumentationAssistantInputSchema>;

const DocumentationAssistantOutputSchema = z.object({
  answer: z.string().describe('Comprehensive answer to the user\'s question.'),
  codeExamples: z.array(z.object({
    language: z.string(),
    code: z.string(),
    description: z.string()
  })).optional().describe('Relevant code examples if applicable.'),
  relatedTopics: z.array(z.string()).optional().describe('Related topics the user might be interested in.'),
  suggestedQuestions: z.array(z.string()).optional().describe('Follow-up questions the user might ask.'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the answer (0-1).'),
  sources: z.array(z.string()).optional().describe('Documentation sections referenced.'),
});
export type DocumentationAssistantOutput = z.infer<typeof DocumentationAssistantOutputSchema>;

export async function documentationAssistant(input: DocumentationAssistantInput): Promise<DocumentationAssistantOutput> {
  return documentationAssistantFlow(input);
}

const documentationAssistantPrompt = ai.definePrompt({
  name: 'documentationAssistantPrompt',
  input: {schema: DocumentationAssistantInputSchema},
  output: {schema: DocumentationAssistantOutputSchema},
  prompt: `You are an expert AI assistant specializing in technical documentation. Your role is to provide comprehensive, accurate, and helpful answers based on the documentation content.

USER LEVEL: {{userLevel}}
- Beginner: Provide detailed explanations, avoid jargon, include setup steps
- Intermediate: Balanced explanations with practical examples
- Advanced: Concise answers focusing on implementation details and edge cases

DOCUMENTATION CONTEXT:
{{documentationContext}}

{{#if conversationHistory}}
CONVERSATION HISTORY:
{{#each conversationHistory}}
Q: {{question}}
A: {{answer}}

{{/each}}
{{/if}}

CURRENT QUESTION: {{question}}

INSTRUCTIONS:
1. Provide a comprehensive answer based ONLY on the documentation context
2. If the question cannot be fully answered from the context, acknowledge the limitations
3. Include practical code examples when relevant
4. Suggest related topics and follow-up questions
5. Maintain consistent tone appropriate for the user level
6. Reference specific documentation sections when possible
7. Provide a confidence score based on how well the documentation covers the topic

ANSWER FORMAT:
- Direct answer to the question
- Step-by-step instructions if applicable
- Code examples with explanations
- Best practices and common pitfalls
- Related concepts worth exploring`,
});

const documentationAssistantFlow = ai.defineFlow(
  {
    name: 'documentationAssistantFlow',
    inputSchema: DocumentationAssistantInputSchema,
    outputSchema: DocumentationAssistantOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await documentationAssistantPrompt(input);
      
      if (!output) {
        throw new Error('Failed to generate documentation assistance.');
      }

      // Post-process the output
      return {
        ...output,
        confidence: Math.max(0, Math.min(1, output.confidence || 0.7)),
        codeExamples: output.codeExamples || [],
        relatedTopics: output.relatedTopics || [],
        suggestedQuestions: output.suggestedQuestions || [],
        sources: output.sources || [],
      };
    } catch (error) {
      console.error('Documentation assistant flow error:', error);
      return {
        answer: "I'm sorry, I couldn't process your question at the moment. Please try rephrasing your question or check the documentation directly.",
        confidence: 0,
        codeExamples: [],
        relatedTopics: [],
        suggestedQuestions: [],
        sources: [],
      };
    }
  }
);