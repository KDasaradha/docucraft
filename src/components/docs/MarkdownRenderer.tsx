'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';

// Ensure Prism core and specific languages are imported if rehype-prism-plus needs them
// or if any client-side Prism interaction (beyond highlighting by rehype-prism-plus) is planned.
// For rehype-prism-plus, these imports make the languages available to its underlying refractor.
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
// Import Prism line numbers plugin CSS. JS might not be needed if rehype-prism-plus handles it.
// The CSS is in globals.css. If rehype-prism-plus adds line number classes, CSS will style them.


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Common components for structural elements, consistent for SSR and client.
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

// Components for SSR and initial client render.
// These should render the HTML structure exactly as rehype-prism-plus would have generated it.
const ssrAndInitialClientComponents: Components = {
  ...commonComponents,
  pre: ({ node, children, ...props }) => {
    // `props` will include `className` (e.g., "language-typescript line-numbers")
    // added by `rehype-prism-plus`. We pass these through.
    // Tailwind prose styles (like `my-6`) will apply via the parent `markdown-content` class.
    return <pre {...props}>{children}</pre>;
  },
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      // Inline code styling is handled by global CSS targeting:
      // .markdown-content :where(code):not(:where(pre > *))
      return <code className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", className)} {...props}>{children}</code>;
    }
    // For code blocks, `className` (e.g., "language-typescript") is passed by ReactMarkdown
    // from what `rehype-prism-plus` added to the AST node.
    return <code className={className} {...props}>{children}</code>;
  },
};


export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  // markdownRootRef is not strictly needed anymore if Prism.highlightAllUnder is removed,
  // but keeping it doesn't harm if other client-side DOM manipulations were planned.
  const markdownRootRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Removed useEffect for Prism.highlightAllUnder as rehype-prism-plus handles highlighting.

  // Components for client-side render after mount (enhancements like copy button).
  const clientSideComponents: Components = {
    ...commonComponents,
    pre: ({ node, children, ...props }) => { // `props` includes className from rehype-prism-plus
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
      
      // The actual &lt;pre&gt; tag and its children (including &lt;code&gt; and token spans)
      // are rendered by ReactMarkdown's default behavior using the AST modified by rehype-prism-plus.
      // We just wrap it for the copy button.
      return (
        <div className="relative group"> 
          <pre {...props} ref={preElementRef}>
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
    code: ({ node, inline, className, children, ...props }) => {
       if (inline) {
        return <code className={cn("bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm font-mono", className)} {...props}>{children}</code>;
      }
      // For code blocks, `className` from rehype-prism-plus is passed.
      // The content `children` will be the already tokenized spans from rehype-prism-plus.
      return <code className={className} {...props}>{children}</code>;
    }
  };
  
  // For SSR and initial client render before hydration, use components that simply pass through
  // classes from rehype-prism-plus. No copy button here.
  if (!isMounted) {
    return (
      // The ref is not used here, but ReactMarkdown still needs a root if we don't pass a ref to it directly.
      // An outer div for the ref is only needed if the ref itself is used for DOM manipulation on mount.
      // Since Prism.highlightAllUnder is removed, the div with ref might not be needed unless for other purposes.
      // For now, let's keep the structure consistent for ReactMarkdown's expectations.
      <div ref={markdownRootRef} className={className}> 
        <ReactMarkdown
          className='markdown-content' // Applied to the root element rendered by ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
          components={ssrAndInitialClientComponents} 
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Client-side render after mount, uses components with client-side enhancements (e.g., copy button)
  return (
    <div ref={markdownRootRef} className={className}>
      <ReactMarkdown
        className='markdown-content'
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
        components={clientSideComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
