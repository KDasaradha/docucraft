
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
    // Server-side rendering and initial client-side render pass:
    // Use ReactMarkdown's default rendering for `pre` and `code` after rehype-prism-plus
    // has modified the HAST. Styling is handled by globals.css.
    // This ensures server and client initial render match.
    return (
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
        components={{
          ...commonComponents,
          // No custom 'pre' or 'code' components here for the SSR pass.
          // This lets rehype-prism-plus output be rendered directly by ReactMarkdown's defaults.
          // Base styling for `pre` (like `my-6`) and inline `code` is applied via `globals.css`.
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  // Client-side rendering after hydration, with interactive elements (like copy button)
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
              // Attempt to get text content from the <code> element within <pre>
              const codeElement = preRef.current.querySelector('code');
              if (codeElement) {
                return codeElement.innerText;
              }
              // Fallback for structures where text might be directly in <pre> or complex spans (less ideal)
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
          
          // (props as any).className will include classes from rehype-prism-plus (e.g., language-ts, line-numbers)
          // We merge our base 'my-6' class with these, though 'my-6' is now primarily in globals.css
          const preClassName = cn('my-6', (props as any).className); 
          
          return (
            <div className="relative group">
              {/* Pass all props from rehype-prism-plus to the <pre> tag */}
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
        // For inline code (not in a <pre> block), rely on global.css or Tailwind Prose styling.
        // If specific client-side override for inline code is needed, it could be added here.
        // code: ({ node, className, children, ...props }) => {
        //   const isCodeBlock = node?.parentElement?.tagName === 'pre';
        //   if (isCodeBlock) {
        //     // This code is inside our custom 'pre' component above.
        //     // It receives 'className' from rehype-prism-plus.
        //     return <code {...props} className={className}>{children}</code>;
        //   }
        //   // For inline code:
        //   return <code {...props} className={cn('bg-muted text-foreground px-1.5 py-0.5 rounded-sm text-sm', className)}>{children}</code>;
        // },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
