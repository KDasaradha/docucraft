"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, CheckCircle, AlertCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentationFeedbackProps {
  pageId?: string;
  pageTitle?: string;
  className?: string;
}

type FeedbackType = 'helpful' | 'not-helpful' | null;
type FeedbackState = 'idle' | 'collecting' | 'submitting' | 'success' | 'error';

const DocumentationFeedback: React.FC<DocumentationFeedbackProps> = ({
  pageId,
  pageTitle,
  className
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [feedbackText, setFeedbackText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFeedbackClick = (type: FeedbackType) => {
    setFeedbackType(type);
    setIsExpanded(true);
    setFeedbackState('collecting');
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackType) return;

    setFeedbackState('submitting');

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send feedback to your backend
      const feedbackData = {
        pageId: pageId || window.location.pathname,
        pageTitle: pageTitle || document.title,
        type: feedbackType,
        comment: feedbackText,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('Feedback submitted:', feedbackData);
      
      setFeedbackState('success');
      
      // Reset after success
      setTimeout(() => {
        setFeedbackState('idle');
        setIsExpanded(false);
        setFeedbackText('');
        setFeedbackType(null);
      }, 3000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedbackState('error');
      
      // Reset error state after 3 seconds
      setTimeout(() => {
        setFeedbackState('collecting');
      }, 3000);
    }
  };

  const getFeedbackPrompt = () => {
    switch (feedbackType) {
      case 'helpful':
        return {
          title: "Great! We're glad this helped",
          placeholder: "What did you find most helpful? (optional)",
          submitText: "Send feedback"
        };
      case 'not-helpful':
        return {
          title: "Help us improve this page",
          placeholder: "What information were you looking for? What was confusing or missing?",
          submitText: "Send feedback"
        };
      default:
        return {
          title: "Share your feedback",
          placeholder: "Tell us about your experience...",
          submitText: "Send feedback"
        };
    }
  };

  const prompt = getFeedbackPrompt();

  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          Was this page helpful?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {feedbackState === 'idle' && (
            <motion.div
              key="feedback-buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedbackClick('helpful')}
                className="flex-1 gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-800"
              >
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedbackClick('not-helpful')}
                className="flex-1 gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950 dark:hover:border-red-800"
              >
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </motion.div>
          )}

          {feedbackState === 'collecting' && (
            <motion.div
              key="feedback-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                {feedbackType === 'helpful' ? (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <ThumbsUp className="h-3 w-3" />
                    Helpful
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                    <ThumbsDown className="h-3 w-3" />
                    Not helpful
                  </Badge>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">{prompt.title}</p>
                <Textarea
                  placeholder={prompt.placeholder}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {feedbackText.length}/500 characters
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitFeedback}
                  size="sm"
                  className="gap-2"
                  disabled={feedbackType === 'not-helpful' && !feedbackText.trim()}
                >
                  <Send className="h-3 w-3" />
                  {prompt.submitText}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFeedbackState('idle');
                    setIsExpanded(false);
                    setFeedbackText('');
                    setFeedbackType(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {feedbackState === 'submitting' && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 py-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <MessageSquare className="h-5 w-5 text-primary" />
              </motion.div>
              <span className="text-sm text-muted-foreground">Sending your feedback...</span>
            </motion.div>
          )}

          {feedbackState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 py-4 text-green-600 dark:text-green-400"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="text-sm font-medium">Thank you for your feedback!</p>
                <p className="text-xs text-muted-foreground">Your input helps us improve our documentation.</p>
              </div>
            </motion.div>
          )}

          {feedbackState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 py-4 text-red-600 dark:text-red-400"
            >
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Failed to send feedback</p>
                <p className="text-xs text-muted-foreground">Please try again later.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick stats or additional info */}
        {feedbackState === 'idle' && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Your feedback helps us improve our documentation
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentationFeedback;