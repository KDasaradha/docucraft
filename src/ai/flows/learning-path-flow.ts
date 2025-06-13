'use server';
/**
 * @fileOverview AI Learning Path Generator
 * 
 * Creates personalized learning paths based on user's current knowledge,
 * goals, and available documentation content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningPathInputSchema = z.object({
  currentSkills: z.array(z.string()).describe('User\'s current technical skills.'),
  targetGoals: z.array(z.string()).describe('What the user wants to learn or achieve.'),
  timeAvailable: z.enum(['1-2 hours/week', '3-5 hours/week', '6-10 hours/week', '10+ hours/week']).describe('Time available for learning.'),
  learningStyle: z.enum(['hands-on', 'theoretical', 'mixed']).optional().default('mixed').describe('Preferred learning style.'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('Overall experience level.'),
  availableContent: z.string().describe('Available documentation content to create path from.'),
  specificInterests: z.array(z.string()).optional().describe('Specific topics of interest.'),
});
export type LearningPathInput = z.infer<typeof LearningPathInputSchema>;

const LearningStepSchema = z.object({
  title: z.string().describe('Title of the learning step.'),
  description: z.string().describe('What the user will learn in this step.'),
  estimatedTime: z.string().describe('Estimated time to complete this step.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level of this step.'),
  prerequisites: z.array(z.string()).optional().describe('What should be completed before this step.'),
  resources: z.array(z.object({
    title: z.string(),
    type: z.enum(['documentation', 'tutorial', 'example', 'practice'],),
    path: z.string().optional(),
    description: z.string()
  })).describe('Learning resources for this step.'),
  practiceExercises: z.array(z.string()).optional().describe('Hands-on exercises to reinforce learning.'),
  outcomes: z.array(z.string()).describe('What the user will be able to do after completing this step.'),
});

const LearningPathOutputSchema = z.object({
  pathTitle: z.string().describe('Title of the personalized learning path.'),
  pathDescription: z.string().describe('Overview of what this learning path covers.'),
  totalEstimatedTime: z.string().describe('Total estimated time to complete the entire path.'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Overall difficulty of the path.'),
  steps: z.array(LearningStepSchema).describe('Ordered list of learning steps.'),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    completionCriteria: z.array(z.string())
  })).optional().describe('Major milestones in the learning journey.'),
  additionalResources: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['book', 'course', 'community', 'tool']),
    url: z.string().optional()
  })).optional().describe('Additional external resources.'),
  tips: z.array(z.string()).optional().describe('Tips for success in this learning path.'),
});
export type LearningPathOutput = z.infer<typeof LearningPathOutputSchema>;

export async function generateLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
  return learningPathFlow(input);
}

const learningPathPrompt = ai.definePrompt({
  name: 'learningPathPrompt',
  input: {schema: LearningPathInputSchema},
  output: {schema: LearningPathOutputSchema},
  prompt: `You are an expert learning path designer and technical educator. Create a personalized, structured learning path based on the user's profile and available documentation.

USER PROFILE:
- Current Skills: {{#each currentSkills}}{{this}}, {{/each}}
- Target Goals: {{#each targetGoals}}{{this}}, {{/each}}
- Experience Level: {{experienceLevel}}
- Time Available: {{timeAvailable}}
- Learning Style: {{learningStyle}}
{{#if specificInterests}}
- Specific Interests: {{#each specificInterests}}{{this}}, {{/each}}
{{/if}}

AVAILABLE DOCUMENTATION CONTENT:
{{availableContent}}

LEARNING PATH DESIGN PRINCIPLES:

1. **PROGRESSIVE STRUCTURE**
   - Start with fundamentals the user might be missing
   - Build complexity gradually
   - Ensure each step prepares for the next

2. **PRACTICAL FOCUS**
   - Include hands-on exercises
   - Real-world examples and use cases
   - Project-based learning milestones

3. **TIME MANAGEMENT**
   - Break down into manageable chunks
   - Provide realistic time estimates
   - Suggest weekly/daily schedules

4. **LEARNING STYLE ADAPTATION**
   - Hands-on: More examples, exercises, labs
   - Theoretical: Concepts, principles, deep dives
   - Mixed: Balanced approach with both

5. **SKILL GAPS IDENTIFICATION**
   - Identify what the user needs to learn
   - Address prerequisites explicitly
   - Build confidence through achievable steps

6. **RESOURCE OPTIMIZATION**
   - Use available documentation effectively
   - Suggest complementary resources
   - Create clear resource hierarchy

Create a learning path that:
- Is tailored to the user's specific situation
- Uses available documentation content effectively  
- Provides clear progression and milestones
- Includes practical exercises and projects
- Gives realistic time estimates
- Offers motivation and success tips

Make the path engaging, achievable, and directly aligned with the user's goals.`,
});

const learningPathFlow = ai.defineFlow(
  {
    name: 'learningPathFlow',
    inputSchema: LearningPathInputSchema,
    outputSchema: LearningPathOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await learningPathPrompt(input);
      
      if (!output) {
        throw new Error('Failed to generate learning path.');
      }

      return {
        pathTitle: output.pathTitle,
        pathDescription: output.pathDescription,
        totalEstimatedTime: output.totalEstimatedTime,
        difficulty: output.difficulty,
        steps: output.steps || [],
        milestones: output.milestones || [],
        additionalResources: output.additionalResources || [],
        tips: output.tips || [],
      };
    } catch (error) {
      console.error('Learning path flow error:', error);
      return {
        pathTitle: "Custom Learning Path",
        pathDescription: "We couldn't generate a personalized learning path at the moment. Please try again or browse the documentation manually.",
        totalEstimatedTime: "Variable",
        difficulty: input.experienceLevel,
        steps: [],
        milestones: [],
        additionalResources: [],
        tips: ["Start with the basics", "Practice regularly", "Don't hesitate to ask questions"],
      };
    }
  }
);