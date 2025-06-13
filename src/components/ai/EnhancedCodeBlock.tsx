'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Brain, 
  Copy, 
  CheckCircle, 
  Loader2, 
  Settings,
  AlertCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CodeExplanationModal from './CodeExplanationModal';
import { type CodeExplanationOutput } from '@/ai';

interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

type ExplainLevel = 'basic' | 'detailed' | 'expert';
type FocusArea = 'functionality' | 'performance' | 'security' | 'best-practices' | 'patterns' | 'testing' | 'debugging' | 'optimization';

const FOCUS_AREAS: { value: FocusArea; label: string }[] = [
  { value: 'functionality', label: 'Functionality' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'best-practices', label: 'Best Practices' },
  { value: 'patterns', label: 'Design Patterns' },
  { value: 'testing', label: 'Testing' },
  { value: 'debugging', label: 'Debugging' },
  { value: 'optimization', label: 'Optimization' },
];

const EXPLAIN_LEVELS: { value: ExplainLevel; label: string; description: string }[] = [
  { value: 'basic', label: 'Basic', description: 'High-level overview and main concepts' },
  { value: 'detailed', label: 'Detailed', description: 'Line-by-line explanation with context' },
  { value: 'expert', label: 'Expert', description: 'Deep dive into algorithms and optimizations' },
];

export default function EnhancedCodeBlock({
  code,
  language,
  title,
  filename,
  showLineNumbers = false,
  highlightLines = [],
  className = ''
}: EnhancedCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [explanation, setExplanation] = useState<CodeExplanationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Settings
  const [explainLevel, setExplainLevel] = useState<ExplainLevel>('detailed');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<FocusArea[]>(['functionality', 'best-practices']);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  const handleExplainCode = useCallback(async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setShowModal(true);
    
    try {
      const response = await fetch('/api/ai/code-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          explainLevel,
          focusAreas: selectedFocusAreas,
          context: `Code from ${title || filename || 'documentation'}`
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to explain code');
      }

      setExplanation(result.data);
    } catch (err) {
      console.error('Error explaining code:', err);
      setError(err instanceof Error ? err.message : 'Failed to explain code');
    } finally {
      setIsLoading(false);
    }
  }, [code, language, explainLevel, selectedFocusAreas, title, filename]);

  const formatLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'jsx': 'React JSX',
      'tsx': 'React TSX',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'rb': 'Ruby',
      'swift': 'Swift',
      'kt': 'Kotlin',
    };
    return languageMap[lang] || lang.toUpperCase();
  };

  const getCodeLines = () => {
    return code.split('\n').map((line, index) => ({
      number: index + 1,
      content: line,
      isHighlighted: highlightLines.includes(index + 1)
    }));
  };

  return (
    <>
      <Card className={`relative group ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-sm font-medium text-muted-foreground">{filename}</span>
            )}
            {title && !filename && (
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            )}
            <Badge variant="secondary" className="text-xs">
              {formatLanguage(language)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-7 w-7 p-0"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="h-7 w-7 p-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copied!' : 'Copy code'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExplainCode}
                    disabled={isLoading || !code.trim()}
                    className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Brain className="h-3 w-3" />
                    )}
                    Explain
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get AI explanation of this code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* AI Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b bg-muted/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="explain-level" className="text-sm font-medium">
                  Explanation Detail Level
                </Label>
                <Select value={explainLevel} onValueChange={(value: ExplainLevel) => setExplainLevel(value)}>
                  <SelectTrigger id="explain-level" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPLAIN_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Focus Areas</Label>
                <div className="flex flex-wrap gap-1">
                  {FOCUS_AREAS.map((area) => (
                    <Button
                      key={area.value}
                      size="sm"
                      variant={selectedFocusAreas.includes(area.value) ? "default" : "outline"}
                      onClick={() => {
                        setSelectedFocusAreas(prev => 
                          prev.includes(area.value)
                            ? prev.filter(a => a !== area.value)
                            : [...prev, area.value]
                        );
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      {area.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Content */}
        <CardContent className="p-0">
          <div className="relative">
            <pre className="overflow-x-auto p-4 text-sm">
              <code className={`language-${language}`}>
                {showLineNumbers ? (
                  <div className="table w-full">
                    {getCodeLines().map((line) => (
                      <div
                        key={line.number}
                        className={`table-row ${line.isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}`}
                      >
                        <span className="table-cell pr-4 text-muted-foreground select-none text-right w-8">
                          {line.number}
                        </span>
                        <span className="table-cell">{line.content}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  code
                )}
              </code>
            </pre>
            
            {/* Quick Actions Overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1 border">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleExplainCode}
                  disabled={isLoading}
                  className="h-6 px-2 text-xs gap-1"
                >
                  <Brain className="h-3 w-3" />
                  AI
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Explanation Modal */}
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