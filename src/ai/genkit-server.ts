// Server-only genkit wrapper
import 'server-only';

let ai: any = null;

// Lazy initialization to avoid loading genkit on client
const getAI = async () => {
  if (!ai) {
    const {genkit} = await import('genkit');
    const {googleAI} = await import('@genkit-ai/googleai');
    
    ai = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.0-flash',
    });
  }
  return ai;
};

export { getAI };