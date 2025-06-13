'use client';

import { useState, useCallback } from 'react';
import { type CodeExplanationOutput } from '@/ai';

interface UseCodeExplanationOptions {
  onSuccess?: (explanation: CodeExplanationOutput) => void;
  onError?: (error: string) => void;
}

interface ExplainCodeParams {
  code: string;
  language: string;
  explainLevel?: 'basic' | 'detailed' | 'expert';
  focusAreas?: string[];
  context?: string;
}

export function useCodeExplanation(options: UseCodeExplanationOptions = {}) {
  const [explanation, setExplanation] = useState<CodeExplanationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explainCode = useCallback(async (params: ExplainCodeParams) => {
    if (!params.code.trim()) {
      setError('Code cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await fetch('/api/ai/code-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: params.code,
          language: params.language,
          explainLevel: params.explainLevel || 'detailed',
          focusAreas: params.focusAreas || ['functionality', 'best-practices'],
          context: params.context,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to explain code');
      }

      const explanationData = result.data as CodeExplanationOutput;
      setExplanation(explanationData);
      options.onSuccess?.(explanationData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to explain code';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setExplanation(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    explanation,
    isLoading,
    error,
    explainCode,
    reset,
  };
}