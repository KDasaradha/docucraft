'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';
// Ensure Prism core is loaded before language components
import 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup'; // For HTML, XML, SVG, MathML
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike'; // Basis for JS, C++, etc.
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash'; // For shell scripts
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-diff'; // For diffs


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Common components for structural elements, for both SSR/initial client and full client.
const commonComponentsBase: Components = {
  h1: ({node, ...props}: any) => <h1 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h2: ({node, ...props}: any) => <h2 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h3: ({node, ...props}: any) => <h3 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h4: ({node, ...props}: any) => <h4 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h5: ({node, ...props}: any) => <h5 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h6: ({node, ...props}: any) => <h6 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  img: ({node, src, alt, ...props}: any) => {
    return <img src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-md my-4 max-w-full h-auto" />;
  },
  // This code component definition is specifically for INLINE code.
  // Block code (inside <pre>) will be handled differently or by default rendering.
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return <code className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", className)} {...props}>{children}</code>;
    }
    // For non-inline code (block code), if this component is used directly (e.g. by clientSideComponents.pre),
    // it passes through className and children, expecting children to be tokenized spans.
    // For SSR/initial render, we aim to let rehype-prism-plus handle the <pre><code> structure entirely.
    return <code className={className} {...props}>{children}</code>;
  },
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markdownRootRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Components for SSR and initial client render.
  // We only override elements that need common handling (like headings, images, INLINE code).
  // For <pre> and its child <code> (block code), we let ReactMarkdown and rehype-prism-plus
  // render them by default to ensure server and client match perfectly for these complex elements.
  const ssrAndInitialClientComponents: Components = {
    ...commonComponentsBase,
    // IMPORTANT: Do NOT override 'pre' here for SSR/initial client render.
    // Let rehype-prism-plus render it directly.
    // The 'code' component from commonComponentsBase will only apply to *inline* code.
  };
  
  // Components for client-side render after mount (enhancements like copy button).
  const clientSideComponents: Components = {
    ...commonComponentsBase, // This includes the inline 'code' handler
    pre: ({ node, children, ...preProps }) => { 
      const [copied, setCopied] = useState(false);
      const preElementRef = useRef<HTMLPreElement>(null);
      
      const getCodeString = () => {
        if (preElementRef.current?.querySelector('code')) {
          return preElementRef.current.querySelector('code')?.innerText || '';
        } else if (preElementRef.current) { 
          return preElementRef.current.innerText;
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
      
      return (
        <div className="relative group"> 
          <pre {...preProps} ref={preElementRef}>
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
    // The 'code' component from commonComponentsBase handles both inline and block code rendering
    // when 'pre' is overridden by clientSideComponents. It correctly passes down className.
  };
  
  return (
    <div ref={markdownRootRef} className={className}> 
      <ReactMarkdown
        className='markdown-content'
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
        components={isMounted ? clientSideComponents : ssrAndInitialClientComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
