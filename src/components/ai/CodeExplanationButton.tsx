'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useCodeExplanation } from '@/hooks/use-code-explanation';
import CodeExplanationModal from './CodeExplanationModal';

interface CodeExplanationButtonProps {
  code: string;
  language: string;
  context?: string;
  explainLevel?: 'basic' | 'detailed' | 'expert';
  focusAreas?: string[];
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function CodeExplanationButton({
  code,
  language,
  context,
  explainLevel = 'detailed',
  focusAreas = ['functionality', 'best-practices'],
  variant = 'outline',
  size = 'sm',
  className = '',
  children
}: CodeExplanationButtonProps) {
  const [showModal, setShowModal] = useState(false);
  
  const { explanation, isLoading, error, explainCode } = useCodeExplanation({
    onSuccess: () => {
      setShowModal(true);
    },
    onError: (error) => {
      console.error('Code explanation error:', error);
      setShowModal(true); // Show modal even on error to display error message
    }
  });

  const handleExplainCode = async () => {
    await explainCode({
      code,
      language,
      context,
      explainLevel,
      focusAreas
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleExplainCode}
        disabled={isLoading || !code.trim()}
        className={`gap-2 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
        {children || 'Explain Code'}
      </Button>

      <CodeExplanationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        code={code}
        language={language}
        explanation={explanation}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}