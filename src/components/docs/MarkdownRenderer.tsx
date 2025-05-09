'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Ensure Prism core is loaded before language components
import 'prismjs/components/prism-core'; 
import 'prismjs/components/prism-markup'; 
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-diff';

// Import Prism line numbers plugin JS. CSS for it is in globals.css.
import 'prismjs/plugins/line-numbers/prism-line-numbers';
// Import Prismjs itself
import Prism from 'prismjs';


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Common components for both SSR and client-side hydration consistency
const commonComponents: Components = {
  h1: ({node, ...props}: any) => <h1 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h2: ({node, ...props}: any) => <h2 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h3: ({node, ...props}: any) => <h3 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h4: ({node, ...props}: any) => <h4 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h5: ({node, ...props}: any) => <h5 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  h6: ({node, ...props}: any) => <h6 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
  img: ({node, src, alt, ...props}: any) => {
    return <img src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-md my-4 max-w-full h-auto" />;
  },
};


export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markdownRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && markdownRootRef.current) {
      const timerId = setTimeout(() => {
        if (markdownRootRef.current) {
          Prism.highlightAllUnder(markdownRootRef.current);
        }
      }, 0);
      return () => clearTimeout(timerId);
    }
  }, [isMounted, content]);

  const components: Components = {
    ...commonComponents,
    pre: ({ node, children, ...preProps }) => {
      let languageClass = '';
      const codeChild = React.Children.toArray(children).find(
        (child: any) => child.type === 'code' && child.props.className
      ) as React.ReactElement | undefined;

      if (codeChild && codeChild.props.className) {
        const match = /language-(\w+)/.exec(codeChild.props.className);
        if (match) {
          languageClass = `language-${match[1]}`;
        }
      }
      
      const preFinalClassName = cn(
        'line-numbers', // For Prism line numbers plugin - ensures this class comes first
        languageClass // Ensures pre has language-xxx if code block specified it
      );

      if (!isMounted) {
        // SSR and initial client render: plain <pre> and <code>.
        // Prism.highlightAllUnder will enhance this on the client after mount.
        return <pre {...preProps} className={preFinalClassName}>{children}</pre>;
      }

      // Client-side render after mount: Add the copy button functionality.
      const [copied, setCopied] = React.useState(false);
      const preElementRef = React.useRef<HTMLPreElement>(null);

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
          <pre {...preProps} ref={preElementRef} className={preFinalClassName}>
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
     code: ({ children, className: codeClassName, node, ...restProps }) => {
      const isInlineCode = !node?.position?.start.line || !node?.parent || (node.parent as any)?.tagName !== 'pre';
      
      if (isInlineCode) {
        // Inline code: styled by .markdown-content :where(code):not(:where(pre > *)) in globals.css
        return <code {...restProps} className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", codeClassName)}>{children}</code>;
      }

      // Code block: Prism adds classes like 'code-highlight' and 'language-xxx'
      // The className prop from react-markdown for fenced code blocks usually has 'language-xxx'.
      // Prism.highlightAllUnder will handle tokenization.
      return <code {...restProps} className={cn(codeClassName, 'code-highlight')}>{children}</code>;
    }
  };
  
  // For SSR and initial client render before hydration, use a simpler set of components
  // to ensure server and client output matches.
  // The dynamic parts (copy button, Prism highlighting) are applied after mount.
  if (!isMounted) {
     const ssrComponents: Components = {
      ...commonComponents,
      pre: ({ children, ...preProps }) => {
        let languageClass = '';
        const codeChild = React.Children.toArray(children).find(
          (child: any) => child.type === 'code' && child.props.className
        ) as React.ReactElement | undefined;
        if (codeChild && codeChild.props.className) {
          const match = /language-(\w+)/.exec(codeChild.props.className);
          if (match) languageClass = `language-${match[1]}`;
        }
        const preFinalClassName = cn('line-numbers', languageClass);
        return <pre {...preProps} className={preFinalClassName}>{children}</pre>;
      },
       code: ({ children, className: codeClassName, node, ...restProps }) => {
        const isInlineCode = !node?.position?.start.line || !node?.parent || (node.parent as any)?.tagName !== 'pre';
        if (isInlineCode) {
          return <code {...restProps} className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", codeClassName)}>{children}</code>;
        }
        // For SSR, ensure the language class is present for Prism's CSS to apply basic block styles
        // `code-highlight` might not be needed or applied consistently by Prism on SSR without JS.
        return <code {...restProps} className={codeClassName}>{children}</code>;
      }
    };
    // We must use these props to ensure server and client initial render match.
    return (
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        components={ssrComponents} // Use SSR-safe components
      >
        {content}
      </ReactMarkdown>
    );
  }

  // Client-side render after mount, uses full components with client-side enhancements
  return (
    <div ref={markdownRootRef}>
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        components={components} // Use full components with client-side logic
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
