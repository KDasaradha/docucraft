'use client';

import React from 'react';
import { EnhancedCodeBlock } from '@/components/ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

// Enhanced code component for MDX
interface CodeProps {
  children: string;
  className?: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: string;
  language?: string;
}

const CodeBlock: React.FC<CodeProps> = ({ 
  children, 
  className = '', 
  title,
  filename,
  showLineNumbers = false,
  highlightLines,
  language 
}) => {
  // Extract language from className (e.g., "language-python" -> "python")
  const lang = language || className.replace(/language-/, '') || 'text';
  
  // Parse highlight lines (e.g., "1,3,5-7" -> [1, 3, 5, 6, 7])
  const parseHighlightLines = (lines?: string): number[] => {
    if (!lines) return [];
    
    return lines.split(',').flatMap(range => {
      const trimmed = range.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return [Number(trimmed)];
    });
  };

  const highlightedLines = parseHighlightLines(highlightLines);

  return (
    <div className="my-6">
      <EnhancedCodeBlock
        code={children.trim()}
        language={lang}
        title={title}
        filename={filename}
        showLineNumbers={showLineNumbers}
        highlightLines={highlightedLines}
      />
    </div>
  );
};

// Enhanced inline code
const InlineCode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
    {children}
  </code>
);

// Custom alert components
const AlertVariants = {
  note: { icon: Info, className: 'border-blue-200 bg-blue-50 text-blue-900' },
  warning: { icon: AlertTriangle, className: 'border-yellow-200 bg-yellow-50 text-yellow-900' },
  success: { icon: CheckCircle, className: 'border-green-200 bg-green-50 text-green-900' },
  error: { icon: XCircle, className: 'border-red-200 bg-red-50 text-red-900' },
};

interface CustomAlertProps {
  type?: keyof typeof AlertVariants;
  title?: string;
  children: React.ReactNode;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ type = 'note', title, children }) => {
  const variant = AlertVariants[type];
  const Icon = variant.icon;

  return (
    <Alert className={`my-4 ${variant.className}`}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
};

// API Reference Card
interface ApiReferenceProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description: string;
  children?: React.ReactNode;
}

const ApiReference: React.FC<ApiReferenceProps> = ({ method, endpoint, description, children }) => {
  const methodColors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge className={`font-mono text-xs ${methodColors[method]}`}>
            {method}
          </Badge>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {endpoint}
          </code>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};

// Code Example with explanation
interface CodeExampleProps {
  title: string;
  language: string;
  code: string;
  explanation?: string;
  highlightLines?: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({ 
  title, 
  language, 
  code, 
  explanation,
  highlightLines 
}) => {
  const parseHighlightLines = (lines?: string): number[] => {
    if (!lines) return [];
    
    return lines.split(',').flatMap(range => {
      const trimmed = range.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
      return [Number(trimmed)];
    });
  };

  return (
    <div className="my-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {explanation && (
            <CardDescription className="text-sm">{explanation}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <EnhancedCodeBlock
            code={code}
            language={language}
            title={title}
            showLineNumbers={true}
            highlightLines={parseHighlightLines(highlightLines)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// File Tree Component
interface FileTreeProps {
  children: React.ReactNode;
}

const FileTree: React.FC<FileTreeProps> = ({ children }) => (
  <div className="my-4 p-4 border rounded-lg bg-muted/30">
    <div className="font-mono text-sm space-y-1">
      {children}
    </div>
  </div>
);

// MDX Components mapping
export const mdxComponents = {
  // Override default code components
  code: ({ children, ...props }: any) => {
    // Check if it's a code block (has className) or inline code
    if (props.className) {
      return <CodeBlock {...props}>{children}</CodeBlock>;
    }
    return <InlineCode>{children}</InlineCode>;
  },
  
  // Pre component (for code blocks)
  pre: ({ children, ...props }: any) => {
    // Extract the code element from pre
    if (React.isValidElement(children) && children.type === 'code') {
      const codeProps: any = children.props || {};
      return (
        <CodeBlock 
          {...(typeof codeProps === 'object' && codeProps !== null ? codeProps : {})}
          {...props}
        >
          {codeProps?.children || ''}
        </CodeBlock>
      );
    }
    return <pre {...props}>{children}</pre>;
  },

  // Custom components
  Alert: CustomAlert,
  ApiReference,
  CodeExample,
  FileTree,
  
  // Enhanced standard components
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground" {...props}>
      {children}
    </blockquote>
  ),
  
  table: ({ children, ...props }: any) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),
  
  th: ({ children, ...props }: any) => (
    <th className="border border-border bg-muted p-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: any) => (
    <td className="border border-border p-2" {...props}>
      {children}
    </td>
  ),
  
  // Headings with better styling
  h1: ({ children, ...props }: any) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mt-8 mb-4 first:mt-0" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: any) => (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-8 mb-4 first:mt-0" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: any) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-3" {...props}>
      {children}
    </h3>
  ),
  
  h4: ({ children, ...props }: any) => (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),
  
  // Lists
  ul: ({ children, ...props }: any) => (
    <ul className="my-6 ml-6 list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: any) => (
    <ol className="my-6 ml-6 list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: any) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  
  // Paragraph
  p: ({ children, ...props }: any) => (
    <p className="leading-7 mb-4" {...props}>
      {children}
    </p>
  ),
  
  // Links
  a: ({ children, href, ...props }: any) => (
    <a 
      href={href}
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      {...props}
    >
      {children}
    </a>
  ),
};