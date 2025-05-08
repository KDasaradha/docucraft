"use client";

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';
import Prism from 'prismjs';
// Import languages you need, or use autoloader
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
// Import line numbers plugin (ensure CSS is also imported in globals.css)
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  useEffect(() => {
    // Delay Prism highlighting slightly to ensure DOM is ready, especially for client-side rendered content
    const timer = setTimeout(() => {
      Prism.highlightAll();
    }, 0);
    return () => clearTimeout(timer);
  }, [content]);

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
          
          // Attempt to find the code element and its content
          let codeString = '';
          let language = '';

          if (node && node.children && node.children.length > 0) {
            const codeNode = node.children.find(child => child.type === 'element' && child.tagName === 'code') as any;
            if (codeNode && codeNode.children && codeNode.children.length > 0) {
              codeString = codeNode.children.map((child: any) => child.value || '').join('');
              if (codeNode.properties && codeNode.properties.className) {
                const langMatch = (codeNode.properties.className as string[]).join(' ').match(/language-(\w+)/);
                if (langMatch) language = langMatch[1];
              }
            }
          }
          
          const handleCopy = () => {
            if (codeString) {
              navigator.clipboard.writeText(codeString).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }
          };
          
          const preClassName = cn(
            (props as any).className, // className from rehypePrismPlus
            language && !((props as any).className || '').includes(`language-${language}`) ? `language-${language}` : '', 
            'line-numbers' // Required for Prism line numbers plugin
          );


          return (
            <div className="relative group my-6">
              <pre {...props} className={preClassName}>
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
