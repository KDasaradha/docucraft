'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Send,
  Loader2,
  Brain,
  User,
  Bot,
  Sparkles,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeExamples?: Array<{
    language: string;
    code: string;
    description: string;
  }>;
  relatedTopics?: string[];
  suggestedQuestions?: string[];
  confidence?: number;
}

interface AIAssistantDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function AIAssistantDialog({ trigger, className }: AIAssistantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'assistant',
        content: `Hello! I'm your AI documentation assistant. I can help you with:

• Understanding complex code concepts
• Finding specific information in the documentation
• Best practices and implementation guidance
• Troubleshooting common issues

What would you like to know about?`,
        timestamp: new Date(),
        suggestedQuestions: [
          'How do I set up JWT authentication?',
          'What are the best practices for error handling?',
          'How do I implement pagination?',
          'What security measures should I consider?'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scroll({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/documentation-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputValue.trim(),
          documentationContext: 'DocuCraft documentation - comprehensive guide for modern web development',
          userLevel: 'intermediate',
          conversationHistory: messages
            .filter(m => m.type === 'user' || m.type === 'assistant')
            .slice(-4) // Keep last 4 messages for context
            .map(m => ({
              question: m.type === 'user' ? m.content : '',
              answer: m.type === 'assistant' ? m.content : ''
            }))
            .filter(entry => entry.question && entry.answer)
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        codeExamples: data.codeExamples,
        relatedTopics: data.relatedTopics,
        suggestedQuestions: data.suggestedQuestions,
        confidence: data.confidence,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  const defaultTrigger = (
    <Button variant="outline" size="lg" className={`gap-2 ${className}`}>
      <MessageSquare className="h-4 w-4" />
      Ask AI Assistant
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="ai-dialog-content sm:max-w-4xl max-h-[85vh] flex flex-col p-0 m-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">AI Documentation Assistant</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Powered by Google AI
          </DialogDescription>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-muted'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`flex-1 max-w-[80%] ${
                      message.type === 'user' ? 'flex justify-end' : ''
                    }`}>
                      <Card className={`${
                        message.type === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-muted/50'
                      }`}>
                        <CardContent className="p-4">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {message.content.split('\n').map((line, idx) => (
                              <p key={idx} className="mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                          
                          {message.confidence && (
                            <div className="mt-3 flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {Math.round(message.confidence * 100)}% confidence
                              </Badge>
                            </div>
                          )}

                          {message.codeExamples && message.codeExamples.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {message.codeExamples.map((example, idx) => (
                                <div key={idx} className="bg-background/50 rounded-md p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {example.language}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {example.description}
                                    </span>
                                  </div>
                                  <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                                    <code>{example.code}</code>
                                  </pre>
                                </div>
                              ))}
                            </div>
                          )}

                          {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Suggested questions:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestedQuestions.map((question, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-auto py-1"
                                    onClick={() => handleSuggestedQuestion(question)}
                                  >
                                    {question}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {message.relatedTopics && message.relatedTopics.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Related topics:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.relatedTopics.map((topic, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about the documentation..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}