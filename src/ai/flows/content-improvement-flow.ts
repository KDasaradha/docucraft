'use server';
/**
 * @fileOverview AI Content Improvement and Quality Analysis
 * 
 * Analyzes documentation content for clarity, completeness, accuracy,
 * and provides suggestions for improvement.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentImprovementInputSchema = z.object({
  content: z.string().describe('The documentation content to analyze and improve.'),
  contentType: z.enum(['tutorial', 'reference', 'guide', 'api-docs', 'readme', 'concept']).describe('Type of documentation content.'),
  targetAudience: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).describe('Target audience for the content.'),
  improvementFocus: z.array(z.enum([
    'clarity', 'completeness', 'accuracy', 'structure', 'examples', 
    'accessibility', 'seo', 'engagement', 'technical-depth'
  ])).optional().describe('Specific areas to focus improvement on.'),
  existingFeedback: z.string().optional().describe('Any existing user feedback or comments.'),
});
export type ContentImprovementInput = z.infer<typeof ContentImprovementInputSchema>;

const ImprovementSuggestionSchema = z.object({
  category: z.enum(['structure', 'content', 'style', 'technical', 'accessibility', 'seo']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  description: z.string(),
  before: z.string().optional(),
  after: z.string().optional(),
  reasoning: z.string(),
  impact: z.string()
});

const ContentImprovementOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall content quality score (0-100).'),
  strengths: z.array(z.string()).describe('What the content does well.'),
  improvements: z.array(ImprovementSuggestionSchema).describe('Specific improvement suggestions.'),
  missingElements: z.array(z.string()).describe('Important elements that are missing.'),
  structuralRecommendations: z.array(z.string()).describe('Suggestions for better content structure.'),
  seoSuggestions: z.array(z.string()).optional().describe('SEO improvement suggestions.'),
  accessibilityNotes: z.array(z.string()).optional().describe('Accessibility improvement notes.'),
  revisedContent: z.string().optional().describe('Improved version of the content (if requested).'),
  nextSteps: z.array(z.string()).describe('Recommended next steps for content improvement.'),
});
export type ContentImprovementOutput = z.infer<typeof ContentImprovementOutputSchema>;

export async function improveContent(input: ContentImprovementInput): Promise<ContentImprovementOutput> {
  return contentImprovementFlow(input);
}

const contentImprovementPrompt = ai.definePrompt({
  name: 'contentImprovementPrompt',
  input: {schema: ContentImprovementInputSchema},
  output: {schema: ContentImprovementOutputSchema},
  prompt: `You are a professional technical writing expert and documentation specialist. Analyze the provided content and provide comprehensive improvement recommendations.

CONTENT TO ANALYZE:
Type: {{contentType}}
Target Audience: {{targetAudience}}
{{#if improvementFocus}}
Focus Areas: {{#each improvementFocus}}{{this}}, {{/each}}
{{/if}}

{{#if existingFeedback}}
Existing Feedback: {{existingFeedback}}
{{/if}}

CONTENT:
{{content}}

ANALYSIS FRAMEWORK:

1. **CONTENT QUALITY ASSESSMENT** (Rate 0-100)
   - Clarity and readability
   - Technical accuracy  
   - Completeness of information
   - Logical structure and flow
   - Appropriate depth for audience

2. **STRUCTURE EVALUATION**
   - Introduction and overview
   - Logical progression
   - Clear headings and sections
   - Conclusion and next steps
   - Navigation and cross-references

3. **TECHNICAL EXCELLENCE**
   - Code examples quality
   - Error handling coverage
   - Best practices inclusion
   - Common pitfalls addressed
   - Up-to-date information

4. **USER EXPERIENCE**
   - Scannable format
   - Visual hierarchy
   - Action-oriented language
   - Clear calls-to-action
   - Practical applicability

5. **ACCESSIBILITY & INCLUSION**
   - Plain language usage
   - Inclusive examples
   - Alternative text considerations
   - Color-blind friendly descriptions
   - International audience considerations

6. **SEO & DISCOVERABILITY**
   - Keyword usage
   - Meta descriptions potential
   - Internal linking opportunities
   - Search-friendly headings
   - Content freshness

IMPROVEMENT CATEGORIES:
- **Structure**: Organization, headings, flow
- **Content**: Information gaps, accuracy, depth
- **Style**: Tone, clarity, readability
- **Technical**: Code quality, examples, best practices
- **Accessibility**: Inclusive design, plain language
- **SEO**: Searchability, keywords, meta content

For each improvement suggestion, provide:
- Clear priority level (critical/high/medium/low)
- Specific before/after examples when applicable
- Reasoning for the suggestion
- Expected impact on user experience

Be constructive, specific, and actionable in your recommendations.`,
});

const contentImprovementFlow = ai.defineFlow(
  {
    name: 'contentImprovementFlow',
    inputSchema: ContentImprovementInputSchema,
    outputSchema: ContentImprovementOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await contentImprovementPrompt(input);
      
      if (!output) {
        throw new Error('Failed to generate content improvement analysis.');
      }

      return {
        overallScore: Math.max(0, Math.min(100, output.overallScore || 60)),
        strengths: output.strengths || [],
        improvements: output.improvements || [],
        missingElements: output.missingElements || [],
        structuralRecommendations: output.structuralRecommendations || [],
        seoSuggestions: output.seoSuggestions || [],
        accessibilityNotes: output.accessibilityNotes || [],
        revisedContent: output.revisedContent,
        nextSteps: output.nextSteps || [],
      };
    } catch (error) {
      console.error('Content improvement flow error:', error);
      return {
        overallScore: 50,
        strengths: ["Content is present and covers the topic"],
        improvements: [],
        missingElements: [],
        structuralRecommendations: ["Review content structure", "Add more examples", "Improve readability"],
        seoSuggestions: [],
        accessibilityNotes: [],
        nextSteps: ["Try the analysis again", "Review content manually"],
      };
    }
  }
);