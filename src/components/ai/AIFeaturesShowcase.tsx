'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAssistantDialog, AISearchDialog } from '@/components/ai';
import { 
  Brain, 
  Search, 
  MessageSquare, 
  Code, 
  GraduationCap, 
  FileCheck, 
  AlertTriangle,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  status: 'active' | 'beta' | 'coming-soon';
  useCases: string[];
  example?: string;
}

const aiFeatures: AIFeature[] = [
  {
    id: 'document-summarization',
    title: 'Document Summarization',
    description: 'Convert lengthy documentation into concise, digestible summaries that capture key points and essential information.',
    icon: <FileCheck className="h-6 w-6" />,
    category: 'Document Processing',
    status: 'active',
    useCases: [
      'API documentation overviews',
      'Tutorial key points extraction',
      'Quick content previews',
      'Executive summaries for technical guides'
    ],
    example: 'summarizeDocument({ markdownContent: longDoc })'
  },
  {
    id: 'intelligent-search',
    title: 'AI-Powered Search',
    description: 'Semantic search that understands context and intent, going beyond simple keyword matching to find truly relevant content.',
    icon: <Search className="h-6 w-6" />,
    category: 'Search Intelligence',
    status: 'active',
    useCases: [
      'Natural language queries',
      'Context-aware results',
      'Relevance scoring',
      'Content snippet generation'
    ],
    example: 'enhancedIntelligentSearch({ query: "JWT auth setup" })'
  },
  {
    id: 'documentation-assistant',
    title: 'Interactive Q&A Assistant',
    description: 'Conversational AI that provides contextual answers, maintains conversation history, and adapts to user skill levels.',
    icon: <MessageSquare className="h-6 w-6" />,
    category: 'Interactive Help',
    status: 'active',
    useCases: [
      'Technical question answering',
      'Context-aware conversations',
      'Skill-level adaptation',
      'Follow-up suggestions'
    ],
    example: 'documentationAssistant({ question: "How to...", userLevel: "intermediate" })'
  },
  {
    id: 'code-explanation',
    title: 'Code Analysis & Explanation',
    description: 'Deep code analysis providing line-by-line explanations, pattern identification, and security recommendations.',
    icon: <Code className="h-6 w-6" />,
    category: 'Code Intelligence',
    status: 'active',
    useCases: [
      'Code walkthrough generation',
      'Best practices identification',
      'Security vulnerability detection',
      'Alternative implementation suggestions'
    ],
    example: 'explainCode({ code, language: "python", explainLevel: "detailed" })'
  },
  {
    id: 'learning-paths',
    title: 'Personalized Learning Paths',
    description: 'Generate custom learning journeys based on current skills, target goals, and available time commitment.',
    icon: <GraduationCap className="h-6 w-6" />,
    category: 'Learning Support',
    status: 'active',
    useCases: [
      'Skill gap analysis',
      'Progressive learning structure',
      'Time-based planning',
      'Resource recommendations'
    ],
    example: 'generateLearningPath({ currentSkills, targetGoals, timeAvailable })'
  },
  {
    id: 'content-improvement',
    title: 'Content Quality Analysis',
    description: 'Comprehensive analysis of documentation quality with specific improvement suggestions and scoring.',
    icon: <Target className="h-6 w-6" />,
    category: 'Content Quality',
    status: 'active',
    useCases: [
      'Quality scoring (0-100)',
      'SEO optimization suggestions',
      'Accessibility improvements',
      'Structure recommendations'
    ],
    example: 'improveContent({ content, contentType: "tutorial", targetAudience })'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Assistant',
    description: 'Diagnose technical problems and provide step-by-step solutions with success probability scoring.',
    icon: <AlertTriangle className="h-6 w-6" />,
    category: 'Problem Solving',
    status: 'active',
    useCases: [
      'Error message analysis',
      'Environment-specific solutions',
      'Prevention recommendations',
      'Escalation guidance'
    ],
    example: 'troubleshootProblem({ problem, errorMessage, environment })'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  beta: 'bg-blue-100 text-blue-800 border-blue-200',
  'coming-soon': 'bg-gray-100 text-gray-800 border-gray-200'
};

const categoryIcons = {
  'Document Processing': <FileCheck className="h-4 w-4" />,
  'Search Intelligence': <Search className="h-4 w-4" />,
  'Interactive Help': <MessageSquare className="h-4 w-4" />,
  'Code Intelligence': <Code className="h-4 w-4" />,
  'Learning Support': <GraduationCap className="h-4 w-4" />,
  'Content Quality': <Target className="h-4 w-4" />,
  'Problem Solving': <AlertTriangle className="h-4 w-4" />
};

export default function AIFeaturesShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...Array.from(new Set(aiFeatures.map(f => f.category)))];
  const filteredFeatures = selectedCategory === 'all' 
    ? aiFeatures 
    : aiFeatures.filter(f => f.category === selectedCategory);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI-Powered Documentation
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the future of documentation with intelligent features that understand, assist, and adapt to your needs.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Google AI Powered</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>Real-time Processing</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
          <TabsTrigger value="all" className="text-xs">All Features</TabsTrigger>
          {categories.slice(1).map(category => (
            <TabsTrigger key={category} value={category} className="text-xs">
              <div className="flex items-center gap-1">
                {categoryIcons[category as keyof typeof categoryIcons]}
                <span className="hidden sm:inline">{category.split(' ')[0]}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6 mt-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature) => (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 text-xs ${statusColors[feature.status]}`}
                        >
                          {feature.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Use Cases */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Key Use Cases
                    </h4>
                    <ul className="space-y-1">
                      {feature.useCases.slice(0, 3).map((useCase, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                          <span className="text-primary text-[10px] mt-1">•</span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Code Example */}
                  {feature.example && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        Usage Example
                      </h4>
                      <div className="bg-muted/50 rounded-md p-2 text-xs font-mono text-muted-foreground border">
                        {feature.example}
                      </div>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center space-y-4 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg p-8">
            <h3 className="text-2xl font-bold">Ready to Experience Intelligent Documentation?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These AI features are integrated throughout DocuCraft, making your documentation experience smarter, faster, and more personalized.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <AISearchDialog />
              <AIAssistantDialog />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}