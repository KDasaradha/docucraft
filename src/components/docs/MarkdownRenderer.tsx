// src/components/docs/MarkdownRenderer.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
// rehype-prism-plus is removed to favor manual client-side Prism highlighting due to hydration issues.

import Prism from 'prismjs';
// Import Prism languages. These will be used by Prism.highlightAllUnder.
// prism-core is often a dependency of other language components like prism-markup.
// If 'prismjs/components/prism-core' is needed explicitly, it can be added,
// but usually importing a language like markup is sufficient to bring in core.
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

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markdownRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && markdownRootRef.current) {
      // Apply Prism highlighting after component is mounted and content is rendered.
      // Use a timeout to ensure the DOM is fully available.
      const timerId = setTimeout(() => {
        if (markdownRootRef.current) {
          Prism.highlightAllUnder(markdownRootRef.current);
        }
      }, 0);
      return () => clearTimeout(timerId);
    }
  }, [isMounted, content]); // Re-run if content changes or after mount

  const components: Components = {
    h1: ({node, ...props}: any) => <h1 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h2: ({node, ...props}: any) => <h2 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h3: ({node, ...props}: any) => <h3 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h4: ({node, ...props}: any) => <h4 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h5: ({node, ...props}: any) => <h5 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    h6: ({node, ...props}: any) => <h6 id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />,
    img: ({node, src, alt, ...props}: any) => {
      return <img src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-md my-4 max-w-full h-auto" />;
    },
    pre: ({ node, children, ...preProps }) => {
      // The `className` prop for <pre> (e.g., "language-js") is usually on the child <code> element
      // when ReactMarkdown processes fenced code blocks.
      // Prism's line-numbers plugin expects 'line-numbers' class on the <pre> tag.
      // Global CSS in globals.css styles pre[class*="language-"] and also adds 'my-6'.
      
      let languageClass = '';
      // Attempt to find the language class from the child <code> element
      const codeChild = React.Children.toArray(children).find(
        (child: any) => child.type === 'code' && child.props.className
      ) as React.ReactElement | undefined;

      if (codeChild && codeChild.props.className) {
        const match = /language-(\w+)/.exec(codeChild.props.className);
        if (match) {
          languageClass = `language-${match[1]}`;
        }
      }
      
      // This className will be on the <pre> tag. Prism.highlightAllUnder will find this structure.
      // globals.css applies 'my-6' and other styles to 'pre[class*="language-"]'.
      const preFinalClassName = cn(
        languageClass, // Ensures pre has language-xxx if code block specified it
        'line-numbers' // For Prism line numbers plugin
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
        } else if (preElementRef.current) { // Fallback if no <code>, e.g. plain <pre>
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
        // The div wrapper for copy button is only added client-side after mount.
        // 'my-6' for margin is applied by globals.css to the <pre> tag.
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
    // Default <code> rendering by ReactMarkdown is fine.
    // Prism.highlightAllUnder will find <code class="language-xxx"> and process its content.
    // Inline <code> elements (not in <pre>) are styled by globals.css.
  };

  return (
    // Add a ref to the root div for Prism.highlightAllUnder to scope its operation.
    <div ref={markdownRootRef}>
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        // No rehype syntax highlighting plugins; manual Prism highlighting via useEffect.
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
