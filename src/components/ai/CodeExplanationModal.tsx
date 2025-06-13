'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  TestTube,
  Layers,
  Loader2,
  Copy,
  X
} from 'lucide-react';
import { type CodeExplanationOutput } from '@/ai';

interface CodeExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  explanation?: CodeExplanationOutput | null;
  isLoading?: boolean;
  error?: string | null;
}

const importanceColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  important: 'bg-orange-100 text-orange-800 border-orange-200',
  helpful: 'bg-blue-100 text-blue-800 border-blue-200',
};

const severityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function CodeExplanationModal({
  isOpen,
  onClose,
  code,
  language,
  explanation,
  isLoading = false,
  error = null,
}: CodeExplanationModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSection('code');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleCopyExplanation = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation.explanation);
      setCopiedSection('explanation');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy explanation:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Code Analysis & Explanation
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of your {language} code with explanations, patterns, and suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[75vh]">
          {/* Code Display */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Code ({language})
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="text-xs"
                >
                  {copiedSection === 'code' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedSection === 'code' ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 text-sm font-mono overflow-x-auto">
                <pre><code>{code}</code></pre>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing code with AI...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Analysis Failed</span>
                </div>
                <p className="text-red-700 mt-2">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Explanation Content */}
          {explanation && !isLoading && (
            <ScrollArea className="flex-1">
              <Tabs defaultValue="explanation" className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-4">
                  <TabsTrigger value="explanation">Overview</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="testing">Testing</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                </TabsList>

                {/* Main Explanation */}
                <TabsContent value="explanation" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Comprehensive Explanation
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyExplanation}
                          className="text-xs"
                        >
                          {copiedSection === 'explanation' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          Copy
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{explanation.explanation}</p>
                      </div>
                      
                      {explanation.bestPractices && explanation.bestPractices.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Best Practices Demonstrated
                          </h4>
                          <ul className="space-y-2">
                            {explanation.bestPractices.map((practice, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 text-xs mt-1">✓</span>
                                <span className="text-sm">{practice}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {explanation.relatedConcepts && explanation.relatedConcepts.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <Layers className="h-4 w-4 text-blue-600" />
                            Related Concepts
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {explanation.relatedConcepts.map((concept, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Key Components */}
                <TabsContent value="components" className="space-y-4">
                  {explanation.keyComponents && explanation.keyComponents.length > 0 ? (
                    <div className="space-y-3">
                      {explanation.keyComponents.map((component, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{component.component}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${importanceColors[component.importance]}`}
                              >
                                {component.importance}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{component.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No key components identified in this code.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Design Patterns */}
                <TabsContent value="patterns" className="space-y-4">
                  {explanation.patterns && explanation.patterns.length > 0 ? (
                    <div className="space-y-4">
                      {explanation.patterns.map((pattern, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Target className="h-4 w-4" />
                              {pattern.pattern}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-3">{pattern.description}</p>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Benefits:</h5>
                              <ul className="space-y-1">
                                {pattern.benefits.map((benefit, benefitIndex) => (
                                  <li key={benefitIndex} className="flex items-start gap-2 text-sm">
                                    <span className="text-green-600 text-xs mt-1">+</span>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No specific design patterns identified in this code.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Potential Issues */}
                <TabsContent value="issues" className="space-y-4">
                  {explanation.potentialIssues && explanation.potentialIssues.length > 0 ? (
                    <div className="space-y-3">
                      {explanation.potentialIssues.map((issue, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                {issue.issue}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${severityColors[issue.severity]}`}
                              >
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{issue.suggestion}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        No significant issues identified in this code!
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Testing Approach */}
                <TabsContent value="testing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Testing Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {explanation.testingApproach ? (
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{explanation.testingApproach}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No specific testing strategy provided.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Alternatives */}
                <TabsContent value="alternatives" className="space-y-4">
                  {explanation.alternatives && explanation.alternatives.length > 0 ? (
                    <div className="space-y-4">
                      {explanation.alternatives.map((alternative, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Lightbulb className="h-4 w-4" />
                              {alternative.approach}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-sm mb-2 text-green-700">Pros:</h5>
                                <ul className="space-y-1">
                                  {alternative.pros.map((pro, proIndex) => (
                                    <li key={proIndex} className="flex items-start gap-2 text-sm">
                                      <span className="text-green-600 text-xs mt-1">+</span>
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm mb-2 text-red-700">Cons:</h5>
                                <ul className="space-y-1">
                                  {alternative.cons.map((con, conIndex) => (
                                    <li key={conIndex} className="flex items-start gap-2 text-sm">
                                      <span className="text-red-600 text-xs mt-1">-</span>
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        No alternative approaches suggested for this code.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}