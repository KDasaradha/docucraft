
"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';

// Ensure Prism core is loaded before language components
import 'prismjs/components/prism-core';
// Dependencies:
// javascript -> clike
// typescript -> javascript
// jsx -> markup, javascript
// tsx -> jsx, typescript
import 'prismjs/components/prism-markup';    // Needed for XML, HTML, SVG, MathML, and by JSX
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';     // Base for many C-like languages
import 'prismjs/components/prism-javascript';// Depends on clike
import 'prismjs/components/prism-typescript';// Depends on javascript
import 'prismjs/components/prism-jsx';       // Depends on markup and javascript
import 'prismjs/components/prism-tsx';       // Depends on jsx and typescript

// Other languages
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-diff';


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const commonComponents = {
    h1: ({node, ...props}: any) => <h1 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h2: ({node, ...props}: any) => <h2 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h3: ({node, ...props}: any) => <h3 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h4: ({node, ...props}: any) => <h4 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h5: ({node, ...props}: any) => <h5 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h6: ({node, ...props}: any) => <h6 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    img: ({node, src, alt, ...props}: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-md my-4 max-w-full h-auto" />;
    },
  };

  if (!isClient) {
    // Server-side rendering: basic Markdown without Prism highlighting or complex components
    return (
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        components={{
          ...commonComponents,
          pre: ({children}) => <pre className="my-6">{children}</pre>,
          code: ({children, className: codeClassName, node}) => {
            // Basic handling for code blocks on SSR to get language class
            // but not the full Prism tokenization.
            const isCodeBlock = node?.parentElement?.tagName === 'pre';
            if (isCodeBlock) {
                 return <code className={codeClassName}>{children}</code>;
            }
            return <code className={cn('bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm', codeClassName)}>{children}</code>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  // Client-side rendering with full Prism highlighting
  return (
    <ReactMarkdown
      className={cn('markdown-content', className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
      components={{
        ...commonComponents,
        pre: ({ node, children, ...props }) => {
          const [copied, setCopied] = React.useState(false);
          const preRef = React.useRef<HTMLPreElement>(null);

          const getCodeString = () => {
            if (preRef.current) {
              const codeElement = preRef.current.querySelector('code');
              if (codeElement) {
                return codeElement.innerText;
              }
              let textContent = '';
              preRef.current.querySelectorAll('span.code-line').forEach(line => {
                 textContent += line.textContent + '\n';
              });
              if (textContent.trim()) return textContent.trim();
              
              return preRef.current.innerText;
            }
            return '';
          };
          
          const handleCopy = () => {
            const codeString = getCodeString();
            if (codeString) {
              navigator.clipboard.writeText(codeString).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }
          };
          
          const preClassName = cn('my-6', (props as any).className); 
          
          return (
            <div className="relative group">
              <pre {...props} ref={preRef} className={preClassName}>
                {children}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-7 w-7 bg-muted/30 hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          );
        },
        code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            // If it's part of a <code> block, rehype-prism-plus provides the full className.
            // We should just pass it through.
            if (match || (node?.parentElement?.tagName === 'pre')) {
              return <code className={className} {...props}>{children}</code>;
            }
            // For inline code not in a <pre> block
            return <code className={cn('bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm', className)} {...props}>{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

