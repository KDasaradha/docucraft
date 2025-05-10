// src/components/docs/MarkdownRenderer.tsx
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
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markdownRootRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    setIsMounted(true);
    // After mount, if Prism is applied via rehype-prism-plus, it should already be done.
    // If manual Prism highlighting was needed, it would go here.
  }, []);

  // Components for SSR and initial client render (before Prism client-side enhancements)
  // Render basic pre/code tags to match server output if rehype-prism-plus is deferred.
  const ssrAndInitialClientComponents: Components = {
    ...commonComponentsBase,
    // Ensure pre and code are rendered consistently between server and initial client
    pre: ({ children, ...preProps }) => {
      // Apply base prose styles if any, but avoid Prism-specific classes here if Prism is deferred
      return <pre {...preProps} className={cn(preProps.className, "my-6")}>{children}</pre>;
    },
    code: ({ node, inline, className: codeClassName, children, ...props }) => {
      const parent = node?.parent as { tagName?: string } | undefined;
      const isBlock = parent?.tagName === 'pre';

      if (inline || !isBlock) {
        return <code className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", codeClassName)} {...props}>{children}</code>;
      }
      // For block code on SSR/initial client: render plain code tag.
      // rehype-prism-plus (if active on client-side) will enhance this.
      // If rehype-prism-plus is SSR-only, then this should match its output structure MINUS client-side JS classes.
      // The key is that server and initial client *structure* and non-JS-dependent classes match.
      return <code className={codeClassName} {...props}>{children}</code>;
    },
  };
  
  // Components for client-side render after mount (enhancements like copy button, Prism highlighting if deferred)
  const clientSideComponents: Components = {
    ...commonComponentsBase, 
    pre: ({ node, children, className: preClassName, ...preProps }) => { 
      const [copied, setCopied] = useState(false);
      const preElementRef = useRef<HTMLPreElement>(null);
      
      // Attempt to extract language from the code block's class name
      // rehype-prism-plus adds 'language-xxxx' to the <code> element,
      // and 'line-numbers' to the <pre> element.
      let language = '';
      const codeChild = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === 'code'
      ) as React.ReactElement | undefined;

      if (codeChild && codeChild.props.className) {
        const match = /language-(\S+)/.exec(codeChild.props.className);
        if (match) {
          language = match[1];
        }
      }
      // If `rehype-prism-plus` added `line-numbers` to `pre`, preserve it.
      const finalPreClassName = cn(preClassName, 'line-numbers', 'my-6');


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
          <pre {...preProps} ref={preElementRef} className={finalPreClassName}>
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
    code: ({ node, inline, className: codeClassName, children, ...props }) => {
      const parent = node?.parent as { tagName?: string } | undefined;
      const isBlock = parent?.tagName === 'pre';

      if (inline || !isBlock) {
        return <code className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", codeClassName)} {...props}>{children}</code>;
      }
      // For block code on client after mount, rehype-prism-plus should have added its classes.
      // The className here will include `language-X` from rehype-prism-plus.
      return <code className={cn(codeClassName, "code-highlight")} {...props}>{children}</code>;
    },
  };
  
  // Determine which set of components and plugins to use based on mount state
  const currentPlugins = isMounted ? [[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]] : [];
  const currentComponentsToUse = isMounted ? clientSideComponents : ssrAndInitialClientComponents;

  return (
    <div ref={markdownRootRef} className={className}> 
      <ReactMarkdown
        className='markdown-content'
        remarkPlugins={[remarkGfm]}
        rehypePlugins={currentPlugins}
        components={currentComponentsToUse}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

    