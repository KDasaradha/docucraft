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
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-shell-session'; 

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

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markdownRootRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && markdownRootRef.current) {
      // Enhanced GSAP animation for the entire markdown block
      const timer = setTimeout(() => {
        if (markdownRootRef.current) {
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
          
          // Force syntax highlighting on all code blocks
          const codeBlocks = markdownRootRef.current.querySelectorAll('pre:not([class*="language-"])');
          codeBlocks.forEach((block) => {
            // Add default language class if none exists
            if (!block.className.includes('language-')) {
              block.classList.add('language-text');
            }
            // Ensure proper data attribute for language badge
            if (!block.getAttribute('data-language')) {
              block.setAttribute('data-language', 'text');
            }
          });
          
          // Force re-highlight with Prism if available
          if (typeof window !== 'undefined' && (window as any).Prism) {
            (window as any).Prism.highlightAllUnder(markdownRootRef.current);
          }
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        // More efficient cleanup - only kill ScrollTriggers for this component
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.trigger === markdownRootRef.current || 
              (markdownRootRef.current && trigger.trigger instanceof Element && markdownRootRef.current.contains(trigger.trigger))) {
            trigger.kill();
          }
        });
      };
    }
  }, [isMounted, content]);


  const components: Components = {
    // Apply GSAP animations to heading elements only when mounted
    h1: ({node, ...props}: any) => {
      const ref = useRef<HTMLHeadingElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, [isMounted]);
      return <h1 ref={ref} id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />;
    },
    h2: ({node, ...props}: any) => {
      const ref = useRef<HTMLHeadingElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.1, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, [isMounted]);
      return <h2 ref={ref} id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />;
    },
    h3: ({node, ...props}: any) => {
      const ref = useRef<HTMLHeadingElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, delay: 0.2, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, [isMounted]);
      return <h3 ref={ref} id={String(props.children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')} {...props} />;
    },
    p: ({node, ...props}: any) => {
      const ref = useRef<HTMLParagraphElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 95%", toggleActions: "play none none none" }}
          );
        }
      }, [isMounted]);
      return <p ref={ref} {...props} />;
    },
    ul: ({node, ...props}: any) => {
      const ref = useRef<HTMLUListElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current.children,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 95%", toggleActions: "play none none none" }}
          );
        }
      }, [isMounted]);
      return <ul ref={ref} {...props} />;
    },
    ol: ({node, ...props}: any) => {
      const ref = useRef<HTMLOListElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current.children,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 95%", toggleActions: "play none none none" }}
          );
        }
      }, [isMounted]);
      return <ol ref={ref} {...props} />;
    },
    img: ({node, src, alt, ...props}: any) => {
      const ref = useRef<HTMLImageElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current, 
            { opacity: 0, scale: 0.95 }, 
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, [isMounted]);
      return <img ref={ref} src={src || ""} alt={alt || ""} {...props} className="rounded-md shadow-lg my-6 max-w-full h-auto transition-transform duration-300 hover:scale-105" />;
    },
    blockquote: ({node, ...props}: any) => {
      const ref = useRef<HTMLQuoteElement>(null);
      useEffect(() => {
        if (isMounted && ref.current) {
          gsap.fromTo(ref.current, 
            { opacity: 0, x: -20 }, 
            { opacity: 1, x: 0, duration: 0.5, scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, [isMounted]);
      return <blockquote ref={ref} {...props} />;
    },
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
      
      const preFinalClassName = cn(
        'line-numbers', 
        language ? `language-${language}` : 'language-text', 
        preClassName, 
        "my-6",
        "code-highlight" // Always add this class for consistent styling
      );
      
      // Add data-language attribute for the language badge
      const dataLanguageAttr = { 'data-language': language || 'text' };

      useEffect(() => {
        if (isMounted && preRef.current) {
          gsap.fromTo(preRef.current, 
            { opacity: 0, y: 20, scale: 0.98 }, 
            { opacity: 1, y: 0, scale: 1, duration: 0.5, scrollTrigger: { trigger: preRef.current, start: "top 90%", toggleActions: "play none none none" } }
          );
        }
      }, [isMounted]);
      
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
          <pre {...preProps} ref={preRef} className={preFinalClassName} tabIndex={0} {...dataLanguageAttr}>
            {children} 
          </pre>
          {isMounted && (
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
          )}
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

  // Show a loading placeholder until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={markdownRootRef} className={cn(className, 'force-code-style')}> 
      <ReactMarkdown
        className={cn('markdown-content', className)}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
    
