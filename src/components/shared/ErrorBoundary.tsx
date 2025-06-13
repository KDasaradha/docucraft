"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Generate a unique event ID for error tracking
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({ error, errorInfo, eventId });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.handleReset();
      }
    }
    
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined, 
      eventId: undefined 
    });
  };

  handleReportError = () => {
    const { error, errorInfo, eventId } = this.state;
    
    // In a real app, you'd send this to an error reporting service
    const errorReport = {
      eventId,
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Error Report:', errorReport);
    
    // For demo purposes, we'll just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert('Error details copied to clipboard');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div 
          className="min-h-[400px] flex items-center justify-center p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="max-w-lg w-full space-y-6">
            <motion.div 
              className="text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <AlertTriangle className="h-16 w-16 text-destructive" />
                  <motion.div
                    className="absolute inset-0 h-16 w-16 border-2 border-destructive rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{ opacity: 0.3 }}
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground">
                Don't worry, this happens sometimes. We've logged the error and will look into it.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
                <Bug className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2 space-y-2">
                  <p>An unexpected error occurred while rendering this component.</p>
                  {this.state.eventId && (
                    <p className="text-xs font-mono bg-background/50 p-2 rounded">
                      Error ID: {this.state.eventId}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details 
                className="text-left bg-muted/50 p-4 rounded-lg text-sm border"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <summary className="cursor-pointer font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Technical Details (Development Mode)
                </summary>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-destructive mb-1">Error Message:</h4>
                    <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <h4 className="font-medium text-destructive mb-1">Stack Trace:</h4>
                      <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-medium text-destructive mb-1">Component Stack:</h4>
                      <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.details>
            )}

            <motion.div 
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={this.handleReset} 
                variant="outline"
                className="hover-lift focus-ring"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleReportError}
                variant="outline"
                className="hover-lift focus-ring"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
              
              <Button asChild className="button-hover focus-ring">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </motion.div>

            <motion.p 
              className="text-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              If this problem persists, please contact support with the error ID above.
            </motion.p>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;