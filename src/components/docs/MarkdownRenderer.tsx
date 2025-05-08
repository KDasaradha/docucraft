"use client";

import React from 'react'; // Removed useEffect
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';
// Prism core is not explicitly needed here if rehype-prism-plus handles everything.
// Languages are needed for rehype-prism-plus to use.
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-diff';
// Removed import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
// The CSS for line numbers is imported in globals.css and should still apply
// if rehype-prism-plus generates the correct classes.

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // useEffect for Prism.highlightAll() removed.
  // rehype-prism-plus should handle static generation of highlighted code.

  return (
    <ReactMarkdown
      className={cn('markdown-content', className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
      components={{
        h1: ({node, ...props}) => <h1 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
        h2: ({node, ...props}) => <h2 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
        h3: ({node, ...props}) => <h3 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
        h4: ({node, ...props}) => <h4 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
        h5: ({node, ...props}) => <h5 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
        h6: ({node, ...props}) => <h6 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
        img: ({node, src, alt, ...props}) => {
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-md my-4 max-w-full h-auto" />;
        },
        pre: ({ node, children, ...props }) => {
          const [copied, setCopied] = React.useState(false);
          const preRef = React.useRef<HTMLPreElement>(null);

          const getCodeString = () => {
            if (preRef.current) {
              const codeElement = preRef.current.querySelector('code');
              if (codeElement) {
                return codeElement.innerText;
              }
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
          
          // props.className will contain classes from rehype-prism-plus (e.g., language-xxxx, line-numbers)
          // We merge it with 'my-6' for consistent margin.
          const preClassName = cn((props as any).className, 'my-6'); 
          
          return (
            <div className="relative group">
              {/* Pass through props from rehype-prism-plus, including its generated className */}
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
