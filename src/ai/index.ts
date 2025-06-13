/**
 * @fileOverview Central AI Functions Export
 * 
 * This file provides easy access to all AI-powered features in the documentation application.
 * Import from here to use any AI functionality throughout the app.
 */

// Core AI configuration
export { ai } from './genkit';

// Document Processing
export { 
  summarizeDocument, 
  type SummarizeDocumentInput, 
  type SummarizeDocumentOutput 
} from './flows/summarize-document-flow';

// Search Capabilities
export { 
  intelligentSearch, 
  type IntelligentSearchInput, 
  type IntelligentSearchOutput 
} from './flows/intelligent-search';

export { 
  enhancedIntelligentSearch, 
  type EnhancedSearchInput, 
  type EnhancedSearchOutput 
} from './flows/enhanced-search';

// Interactive Assistant
export { 
  documentationAssistant, 
  type DocumentationAssistantInput, 
  type DocumentationAssistantOutput 
} from './flows/documentation-assistant-flow';

// Code Analysis
export { 
  explainCode, 
  type CodeExplanationInput, 
  type CodeExplanationOutput 
} from './flows/code-explanation-flow';

// Learning Support
export { 
  generateLearningPath, 
  type LearningPathInput, 
  type LearningPathOutput 
} from './flows/learning-path-flow';

// Content Quality
export { 
  improveContent, 
  type ContentImprovementInput, 
  type ContentImprovementOutput 
} from './flows/content-improvement-flow';

// Problem Solving
export { 
  troubleshootProblem, 
  type TroubleshootingInput, 
  type TroubleshootingOutput 
} from './flows/troubleshooting-assistant-flow';

/**
 * AI Feature Categories for easy organization
 */
export const AI_FEATURES = {
  DOCUMENT_PROCESSING: {
    summarize: 'Summarize long documents into key points',
  },
  SEARCH: {
    intelligent: 'AI-powered semantic search',
    enhanced: 'Advanced search with relevance scoring',
  },
  ASSISTANCE: {
    documentation: 'Interactive Q&A with documentation context',
    troubleshooting: 'Problem diagnosis and solution suggestions',
  },
  CODE: {
    explanation: 'Detailed code analysis and explanation',
  },
  LEARNING: {
    pathGeneration: 'Personalized learning paths',
  },
  CONTENT: {
    improvement: 'Content quality analysis and suggestions',
  }
} as const;

/**
 * AI Usage Examples
 */
export const AI_USAGE_EXAMPLES = {
  // Document Summarization
  SUMMARIZE_API_DOCS: {
    description: 'Summarize lengthy API documentation',
    code: `
import { summarizeDocument } from '@/ai';

const summary = await summarizeDocument({
  markdownContent: longApiDocumentation
});
console.log(summary.summary);
    `
  },
  
  // Enhanced Search
  INTELLIGENT_SEARCH: {
    description: 'Search with AI-powered relevance ranking',
    code: `
import { enhancedIntelligentSearch } from '@/ai';

const results = await enhancedIntelligentSearch({
  query: 'FastAPI authentication JWT',
  documentationContent: allDocsContent,
  maxResults: 5
});
    `
  },
  
  // Documentation Assistant
  INTERACTIVE_HELP: {
    description: 'Get contextual help and answers',
    code: `
import { documentationAssistant } from '@/ai';

const help = await documentationAssistant({
  question: 'How do I set up JWT authentication in FastAPI?',
  documentationContext: relevantDocs,
  userLevel: 'intermediate'
});
    `
  },
  
  // Code Explanation
  CODE_ANALYSIS: {
    description: 'Analyze and explain code snippets',
    code: `
import { explainCode } from '@/ai';

const explanation = await explainCode({
  code: 'async def create_user(user: UserCreate, db: Session = Depends(get_db)):',
  language: 'python',
  explainLevel: 'detailed'
});
    `
  },
  
  // Learning Path
  PERSONALIZED_LEARNING: {
    description: 'Generate custom learning paths',
    code: `
import { generateLearningPath } from '@/ai';

const path = await generateLearningPath({
  currentSkills: ['Python', 'Basic Web Development'],
  targetGoals: ['FastAPI Mastery', 'API Security'],
  experienceLevel: 'intermediate',
  timeAvailable: '5-10 hours/week'
});
    `
  }
};