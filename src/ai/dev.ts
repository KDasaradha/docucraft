
import { config } from 'dotenv';
config();

// Import all AI flows for development
import '@/ai/flows/intelligent-search.ts';
import '@/ai/flows/enhanced-search.ts';
import '@/ai/flows/summarize-document-flow.ts';
import '@/ai/flows/documentation-assistant-flow.ts';
import '@/ai/flows/code-explanation-flow.ts';
import '@/ai/flows/learning-path-flow.ts';
import '@/ai/flows/content-improvement-flow.ts';
import '@/ai/flows/troubleshooting-assistant-flow.ts';
