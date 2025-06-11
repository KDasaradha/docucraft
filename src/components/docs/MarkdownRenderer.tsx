// src/components/docs/MarkdownRenderer.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

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
import 'prismjs/components/prism-diff'; 


import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const commonComponentsBase: Components = {
  // Apply GSAP animations to heading elements
  h1: ({node, ...props}: any) => {
    const ref = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
        );
      }
    }, []);
    return <h1 ref={ref} id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />;
  },
  h2: ({node, ...props}: any) => {
    const ref = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, delay: 0.1, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
        );
      }
    }, []);
    return <h2 ref={ref} id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />;
  },
  h3: ({node, ...props}: any) => {
    const ref = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current, 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.5, delay: 0.2, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
        );
      }
    }, []);
    return <h3 ref={ref} id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />;
  },
   p: ({node, ...props}: any) => { // Animate paragraphs
    const ref = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 95%", toggleActions: "play none none none" }}
        );
      }
    }, []);
    return <p ref={ref} {...props} />;
  },
  ul: ({node, ...props}: any) => { // Animate unordered lists
    const ref = useRef<HTMLUListElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current.children,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 95%", toggleActions: "play none none none" }}
        );
      }
    }, []);
    return <ul ref={ref} {...props} />;
  },
  ol: ({node, ...props}: any) => { // Animate ordered lists
    const ref = useRef<HTMLOListElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current.children,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 95%", toggleActions: "play none none none" }}
        );
      }
    }, []);
    return <ol ref={ref} {...props} />;
  },
  img: ({node, src, alt, ...props}: any) => {
    const ref = useRef<HTMLImageElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current, 
          { opacity: 0, scale: 0.95 }, 
          { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
        );
      }
    }, []);
    return <img ref={ref} src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-lg my-6 max-w-full h-auto transition-transform duration-300 hover:scale-105" />;
  },
  blockquote: ({node, ...props}: any) => {
    const ref = useRef<HTMLQuoteElement>(null);
    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current, 
          { opacity: 0, x: -20 }, 
          { opacity: 1, x: 0, duration: 0.5, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
        );
      }
    }, []);
    return <blockquote ref={ref} {...props} />;
  }
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markdownRootRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    setIsMounted(true);
    if (markdownRootRef.current) {
      // Enhanced GSAP animation for the entire markdown block
      gsap.fromTo(markdownRootRef.current, 
        { opacity: 0, y: 30, scale: 0.98 }, 
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          ease: 'power2.out',
          clearProps: "transform" // Clear transform after animation
        }
      );
    }
    return () => {
      // More efficient cleanup - only kill ScrollTriggers for this component
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === markdownRootRef.current || 
            (markdownRootRef.current && trigger.trigger instanceof Element && markdownRootRef.current.contains(trigger.trigger))) {
          trigger.kill();
        }
      });
    };
  }, [content]);


  const clientSideComponents: Components = {
    ...commonComponentsBase, 
    pre: ({ node, children, className: preClassName, ...preProps }) => { 
      const [copied, setCopied] = useState(false);
      const preRef = useRef<HTMLPreElement>(null);
      
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
      
      const preFinalClassName = cn('line-numbers', language ? `language-${language}` : '', preClassName, "my-6");
      
      // Add data-language attribute for the language badge
      const dataLanguageAttr = language ? { 'data-language': language } : {};

      useEffect(() => {
        if (preRef.current) {
          gsap.fromTo(preRef.current, 
            { opacity: 0, y: 20, scale: 0.98 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, scrollTrigger: { trigger: preRef.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, []);
      
      const getCodeString = () => {
        if (preRef.current?.querySelector('code')) {
          return preRef.current.querySelector('code')?.innerText || '';
        } else if (preRef.current) { 
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
      
      return (
        <motion.div 
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        > 
          <pre {...preProps} ref={preRef} className={preFinalClassName} {...dataLanguageAttr}>
            {children} 
          </pre>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopy}
              className="absolute top-2 right-2 h-8 w-8 bg-muted/50 hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 ease-in-out hover:scale-110 active:scale-95"
              aria-label="Copy code"
              asChild
            >
              <motion.button whileHover={{scale:1.1}} whileTap={{scale:0.9}}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </motion.button>
            </Button>
          </motion.div>
        </motion.div>
      );
    },
    code: ({ node, className: codeClassName, children, ...props }: any) => {
      const parent = (node as any)?.parent as { tagName?: string } | undefined;
      const isBlock = parent?.tagName === 'pre';
      const inline = !isBlock;

      if (inline || !isBlock) {
        return (
          <code 
            className={cn(
              "px-1.5 py-0.5 rounded-md text-sm font-mono font-medium", 
              "bg-gradient-to-r from-[hsl(var(--inline-code-bg-gradient-from))] to-[hsl(var(--inline-code-bg-gradient-to))]",
              "text-[hsl(var(--inline-code-text))] border border-[hsl(var(--inline-code-border))]",
              codeClassName
            )} 
            {...props}
          >
            {children}
          </code>
        );
      }
      return <code className={cn(codeClassName, "code-highlight")} {...props}>{children}</code>;
    },
  };
  
  // SSR and initial client render (no client-side hooks, minimal JS)
  const serverComponents: Components = {
    ...commonComponentsBase,
    pre: ({ children, className: preClassName, node, ...preProps }) => {
      let languageClass = '';
      const codeChild = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === 'code') as React.ReactElement | undefined;
      if (codeChild && codeChild.props.className) {
        const match = /language-(\S+)/.exec(codeChild.props.className);
        if (match) languageClass = `language-${match[1]}`;
      }
      // Ensure line-numbers class is present if rehype-prism-plus is configured to add it server-side
      // This logic tries to mimic what rehype-prism-plus might do on the server
      const finalPreClassName = cn('line-numbers', languageClass, preClassName, 'my-6');
      
      // Add data-language attribute for the language badge
      const match = languageClass ? /language-(\S+)/.exec(languageClass) : null;
      const dataLanguageAttr = match ? { 'data-language': match[1] } : {};
      
      return <pre {...preProps} className={finalPreClassName} {...dataLanguageAttr}>{children}</pre>;
    },
    code: (props) => {
      const { node, className: codeClassName, children, ...rest } = props;
      const parent = (node as any)?.parent as { tagName?: string } | undefined;
      const isBlock = parent?.tagName === 'pre';
      const inline = !isBlock;

      if (inline || !isBlock) {
        return (
          <code
            className={cn(
              "px-1.5 py-0.5 rounded-md text-sm font-mono font-medium", 
              "bg-gradient-to-r from-[hsl(var(--inline-code-bg-gradient-from))] to-[hsl(var(--inline-code-bg-gradient-to))]",
              "text-[hsl(var(--inline-code-text))] border border-[hsl(var(--inline-code-border))]",
              codeClassName
            )}
            {...rest}
          >
            {children}
          </code>
        );
      }

      return (
        <code className={cn(codeClassName)} {...rest}>
          {children}
        </code>
      );
    },
  };

  const currentComponents = isMounted ? clientSideComponents : serverComponents;

  return (
    <div ref={markdownRootRef} className={className}> 
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        // rehypePrismPlus handles Prism.js integration, including adding language classes.
        // The showLineNumbers option will add the 'line-numbers' class to <pre> tags.
        rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
        components={currentComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
    
