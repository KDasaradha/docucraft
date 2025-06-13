'use server';
/**
 * @fileOverview AI Troubleshooting Assistant
 * 
 * Helps users diagnose and solve technical problems based on error messages,
 * symptoms, and available documentation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TroubleshootingInputSchema = z.object({
  problem: z.string().describe('Description of the problem or issue.'),
  errorMessage: z.string().optional().describe('Any error messages encountered.'),
  environment: z.object({
    language: z.string().optional(),
    framework: z.string().optional(),
    version: z.string().optional(),
    os: z.string().optional(),
    browser: z.string().optional()
  }).optional().describe('Technical environment details.'),
  stepsToReproduce: z.array(z.string()).optional().describe('Steps that lead to the problem.'),
  attemptedSolutions: z.array(z.string()).optional().describe('Solutions already tried.'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium').describe('Problem urgency level.'),
  relatedDocumentation: z.string().optional().describe('Relevant documentation content for context.'),
});
export type TroubleshootingInput = z.infer<typeof TroubleshootingInputSchema>;

const SolutionStepSchema = z.object({
  step: z.number().describe('Step number in the solution.'),
  title: z.string().describe('Brief title of the step.'),
  description: z.string().describe('Detailed description of what to do.'),
  code: z.string().optional().describe('Code snippet if applicable.'),
  expectedResult: z.string().optional().describe('What should happen after this step.'),
  troubleshootingTips: z.array(z.string()).optional().describe('Tips if this step doesn\'t work.'),
});

const TroubleshootingOutputSchema = z.object({
  diagnosis: z.string().describe('Analysis of what\'s likely causing the problem.'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the diagnosis (0-1).'),
  solutions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    estimatedTime: z.string(),
    steps: z.array(SolutionStepSchema),
    success_probability: z.number().min(0).max(1)
  })).describe('Potential solutions ranked by likelihood of success.'),
  preventionTips: z.array(z.string()).optional().describe('How to prevent this problem in the future.'),
  relatedIssues: z.array(z.string()).optional().describe('Related problems that might occur.'),
  whenToSeekHelp: z.string().optional().describe('When to escalate or seek additional help.'),
  additionalResources: z.array(z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().optional()
  })).optional().describe('Additional resources that might help.'),
});
export type TroubleshootingOutput = z.infer<typeof TroubleshootingOutputSchema>;

export async function troubleshootProblem(input: TroubleshootingInput): Promise<TroubleshootingOutput> {
  return troubleshootingFlow(input);
}

const troubleshootingPrompt = ai.definePrompt({
  name: 'troubleshootingPrompt',
  input: {schema: TroubleshootingInputSchema},
  output: {schema: TroubleshootingOutputSchema},
  prompt: `You are an expert technical troubleshooting assistant. Your role is to help users diagnose and solve technical problems systematically.

PROBLEM REPORT:
Issue: {{problem}}
{{#if errorMessage}}
Error Message: {{errorMessage}}
{{/if}}
Urgency: {{urgency}}

{{#if environment}}
ENVIRONMENT:
{{#if environment.language}}Language: {{environment.language}}{{/if}}
{{#if environment.framework}}Framework: {{environment.framework}}{{/if}}
{{#if environment.version}}Version: {{environment.version}}{{/if}}
{{#if environment.os}}OS: {{environment.os}}{{/if}}
{{#if environment.browser}}Browser: {{environment.browser}}{{/if}}
{{/if}}

{{#if stepsToReproduce}}
STEPS TO REPRODUCE:
{{#each stepsToReproduce}}{{@index}}. {{this}}
{{/each}}
{{/if}}

{{#if attemptedSolutions}}
ATTEMPTED SOLUTIONS:
{{#each attemptedSolutions}}- {{this}}
{{/each}}
{{/if}}

{{#if relatedDocumentation}}
RELATED DOCUMENTATION:
{{relatedDocumentation}}
{{/if}}

TROUBLESHOOTING METHODOLOGY:

1. **PROBLEM ANALYSIS**
   - Identify root cause based on symptoms
   - Consider environment factors
   - Analyze error messages for clues
   - Account for attempted solutions

2. **SOLUTION RANKING**
   - Most likely to succeed first
   - Consider difficulty and time investment
   - Account for user's technical level
   - Provide multiple approaches

3. **SYSTEMATIC APPROACH**
   - Clear step-by-step instructions
   - Expected outcomes for each step
   - Troubleshooting tips if steps fail
   - Code examples when needed

4. **PREVENTION FOCUS**
   - Explain why the problem occurred
   - Provide prevention strategies
   - Identify warning signs

5. **ESCALATION GUIDANCE**
   - When to seek additional help
   - What information to provide
   - Alternative resources

SOLUTION STRUCTURE:
For each solution, provide:
- Clear title and description
- Difficulty assessment (easy/medium/hard)
- Realistic time estimate
- Step-by-step instructions
- Success probability
- Troubleshooting alternatives

Be practical, specific, and encourage users to understand the "why" behind solutions.`,
});

const troubleshootingFlow = ai.defineFlow(
  {
    name: 'troubleshootingFlow',
    inputSchema: TroubleshootingInputSchema,
    outputSchema: TroubleshootingOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await troubleshootingPrompt(input);
      
      if (!output) {
        throw new Error('Failed to generate troubleshooting assistance.');
      }

      return {
        diagnosis: output.diagnosis,
        confidence: Math.max(0, Math.min(1, output.confidence || 0.7)),
        solutions: output.solutions || [],
        preventionTips: output.preventionTips || [],
        relatedIssues: output.relatedIssues || [],
        whenToSeekHelp: output.whenToSeekHelp,
        additionalResources: output.additionalResources || [],
      };
    } catch (error) {
      console.error('Troubleshooting flow error:', error);
      return {
        diagnosis: "I couldn't analyze this problem fully. Please provide more details about the issue, error messages, and your environment.",
        confidence: 0.3,
        solutions: [{
          title: "General Troubleshooting",
          description: "Try these general steps while we work on a more specific solution.",
          difficulty: "easy" as const,
          estimatedTime: "10-15 minutes",
          steps: [
            {
              step: 1,
              title: "Check error logs",
              description: "Look for detailed error messages in your application logs.",
            },
            {
              step: 2,
              title: "Verify configuration",
              description: "Ensure all configuration files are correct and up-to-date.",
            }
          ],
          success_probability: 0.5
        }],
        preventionTips: ["Keep detailed logs", "Test in staging environments", "Document your setup"],
        whenToSeekHelp: "If the problem persists after trying basic troubleshooting steps.",
      };
    }
  }
);