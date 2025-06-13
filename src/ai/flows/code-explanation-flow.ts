'use server';
/**
 * @fileOverview AI Code Explanation and Analysis
 * 
 * Analyzes code snippets from documentation and provides detailed explanations,
 * identifies patterns, suggests improvements, and explains best practices.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze and explain.'),
  language: z.string().describe('Programming language of the code.'),
  context: z.string().optional().describe('Additional context about where this code is used.'),
  explainLevel: z.enum(['basic', 'detailed', 'expert']).optional().default('detailed').describe('Level of explanation detail.'),
  focusAreas: z.array(z.enum([
    'functionality', 'performance', 'security', 'best-practices', 
    'patterns', 'testing', 'debugging', 'optimization'
  ])).optional().describe('Specific areas to focus the explanation on.'),
});
export type CodeExplanationInput = z.infer<typeof CodeExplanationInputSchema>;

const CodeExplanationOutputSchema = z.object({
  explanation: z.string().describe('Comprehensive explanation of the code.'),
  keyComponents: z.array(z.object({
    component: z.string(),
    description: z.string(),
    importance: z.enum(['critical', 'important', 'helpful'])
  })).describe('Key components and their explanations.'),
  patterns: z.array(z.object({
    pattern: z.string(),
    description: z.string(),
    benefits: z.array(z.string())
  })).optional().describe('Design patterns identified in the code.'),
  bestPractices: z.array(z.string()).optional().describe('Best practices demonstrated or suggested.'),
  potentialIssues: z.array(z.object({
    issue: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    suggestion: z.string()
  })).optional().describe('Potential issues and improvements.'),
  relatedConcepts: z.array(z.string()).optional().describe('Related programming concepts.'),
  testingApproach: z.string().optional().describe('How to test this code.'),
  alternatives: z.array(z.object({
    approach: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string())
  })).optional().describe('Alternative implementation approaches.'),
});
export type CodeExplanationOutput = z.infer<typeof CodeExplanationOutputSchema>;

export async function explainCode(input: CodeExplanationInput): Promise<CodeExplanationOutput> {
  return codeExplanationFlow(input);
}

const codeExplanationPrompt = ai.definePrompt({
  name: 'codeExplanationPrompt',
  input: {schema: CodeExplanationInputSchema},
  output: {schema: CodeExplanationOutputSchema},
  prompt: `You are an expert code analyst and educator. Your task is to analyze and explain code snippets comprehensively.

CODE TO ANALYZE:
Language: {{language}}
{{#if context}}
Context: {{context}}
{{/if}}

\`\`\`{{language}}
{{code}}
\`\`\`

EXPLANATION LEVEL: {{explainLevel}}
- Basic: High-level overview, main purpose, key functions
- Detailed: Line-by-line explanation, logic flow, data structures
- Expert: Deep dive into algorithms, complexity, optimization opportunities

{{#if focusAreas}}
FOCUS AREAS: {{#each focusAreas}}{{this}}, {{/each}}
{{/if}}

ANALYSIS REQUIREMENTS:

1. **COMPREHENSIVE EXPLANATION**
   - Purpose and functionality
   - Step-by-step logic flow
   - Input/output behavior
   - Error handling approach

2. **KEY COMPONENTS**
   - Identify critical parts
   - Explain their roles
   - Rate importance level

3. **DESIGN PATTERNS**
   - Identify any design patterns used
   - Explain benefits and trade-offs

4. **BEST PRACTICES**
   - Highlight good practices shown
   - Suggest improvements if needed

5. **POTENTIAL ISSUES**
   - Security vulnerabilities
   - Performance bottlenecks
   - Maintainability concerns
   - Error handling gaps

6. **TESTING STRATEGY**
   - How to unit test this code
   - Edge cases to consider
   - Mock requirements

7. **ALTERNATIVES**
   - Different implementation approaches
   - When to use each alternative

Provide educational value while being practical and actionable.`,
});

const codeExplanationFlow = ai.defineFlow(
  {
    name: 'codeExplanationFlow',
    inputSchema: CodeExplanationInputSchema,
    outputSchema: CodeExplanationOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await codeExplanationPrompt(input);
      
      if (!output) {
        throw new Error('Failed to generate code explanation.');
      }

      return {
        explanation: output.explanation,
        keyComponents: output.keyComponents || [],
        patterns: output.patterns || [],
        bestPractices: output.bestPractices || [],
        potentialIssues: output.potentialIssues || [],
        relatedConcepts: output.relatedConcepts || [],
        testingApproach: output.testingApproach,
        alternatives: output.alternatives || [],
      };
    } catch (error) {
      console.error('Code explanation flow error:', error);
      return {
        explanation: "I couldn't analyze this code snippet. Please ensure the code is valid and try again.",
        keyComponents: [],
        patterns: [],
        bestPractices: [],
        potentialIssues: [],
        relatedConcepts: [],
        alternatives: [],
      };
    }
  }
);