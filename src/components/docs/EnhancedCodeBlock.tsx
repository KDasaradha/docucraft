"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Play, Download, Maximize2, Minimize2, Terminal, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedCodeBlockProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
  allowCopy?: boolean;
  allowDownload?: boolean;
  allowExpand?: boolean;
  runnable?: boolean;
  className?: string;
}

const EnhancedCodeBlock: React.FC<EnhancedCodeBlockProps> = ({
  children,
  language = 'text',
  filename,
  title,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = '400px',
  allowCopy = true,
  allowDownload = false,
  allowExpand = true,
  runnable = false,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const codeContent = React.Children.toArray(children).join('');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    if (!codeContent) return;
    
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    if (!codeContent) return;
    
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRun = () => {
    // This would integrate with a code execution service
    console.log('Running code:', codeContent);
    // You could integrate with services like CodePen, JSFiddle, or your own execution environment
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md',
      shell: 'sh',
      bash: 'sh',
      powershell: 'ps1',
      sql: 'sql'
    };
    return extensions[lang.toLowerCase()] || 'txt';
  };

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, React.ReactNode> = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      html: '🌐',
      css: '🎨',
      json: '📋',
      shell: '💻',
      bash: '💻',
      terminal: '💻'
    };
    return icons[lang.toLowerCase()] || <FileCode className="h-3 w-3" />;
  };

  const displayTitle = title || filename || language;

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "relative group rounded-lg border bg-muted/30 overflow-hidden",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        {(displayTitle || allowCopy || allowDownload || allowExpand || runnable) && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              {displayTitle && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getLanguageIcon(language)}</span>
                  <span className="text-sm font-medium">{displayTitle}</span>
                  {language && (
                    <Badge variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1"
                  >
                    {runnable && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRun}
                            className="h-7 w-7 p-0"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Run code</TooltipContent>
                      </Tooltip>
                    )}
                    
                    {allowDownload && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownload}
                            className="h-7 w-7 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                    )}
                    
                    {allowExpand && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-7 w-7 p-0"
                          >
                            {isExpanded ? (
                              <Minimize2 className="h-3 w-3" />
                            ) : (
                              <Maximize2 className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {allowCopy && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-7 w-7 p-0"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Check className="h-3 w-3 text-green-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy className="h-3 w-3" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copied ? 'Copied!' : 'Copy code'}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Code Content */}
        <div 
          className={cn(
            "relative overflow-auto",
            !isExpanded && "max-h-[400px]"
          )}
          style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
        >
          <pre
            ref={preRef}
            className={cn(
              "p-4 text-sm leading-relaxed overflow-x-auto",
              showLineNumbers && "pl-12"
            )}
          >
            {showLineNumbers && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-muted/30 border-r flex flex-col text-xs text-muted-foreground">
                {codeContent.split('\n').map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "px-2 py-0.5 text-right leading-relaxed",
                      highlightLines.includes(index + 1) && "bg-yellow-200/20 dark:bg-yellow-900/20"
                    )}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
            <code ref={codeRef} className="font-mono">
              {children}
            </code>
          </pre>
        </div>

        {/* Expand indicator */}
        {!isExpanded && preRef.current && preRef.current.scrollHeight > parseInt(maxHeight) && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted/80 to-transparent flex items-end justify-center pb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-xs h-6"
            >
              Show more
            </Button>
          </div>
        )}

        {/* Copy feedback */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg"
            >
              Copied to clipboard!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedCodeBlock;