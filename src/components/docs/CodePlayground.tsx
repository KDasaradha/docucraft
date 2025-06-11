"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Share2, 
  Settings, 
  Maximize2, 
  Minimize2,
  Code2,
  Terminal,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CodePlaygroundProps {
  initialCode?: string;
  language?: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  readOnly?: boolean;
  showConsole?: boolean;
  showSettings?: boolean;
  height?: string;
  className?: string;
}

interface ExecutionResult {
  output: string;
  error?: string;
  status: 'success' | 'error' | 'warning';
  executionTime: number;
}

const LANGUAGE_CONFIGS = {
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    defaultCode: `// Welcome to the JavaScript playground!
console.log('Hello, World!');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
    runner: 'browser'
  },
  python: {
    name: 'Python',
    extension: 'py',
    defaultCode: `# Welcome to the Python playground!
print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
    runner: 'pyodide'
  },
  typescript: {
    name: 'TypeScript',
    extension: 'ts',
    defaultCode: `// Welcome to the TypeScript playground!
interface User {
  name: string;
  age: number;
  email?: string;
}

const user: User = {
  name: "John Doe",
  age: 30,
  email: "john@example.com"
};

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

console.log(greetUser(user));`,
    runner: 'typescript'
  }
};

export default function CodePlayground({
  initialCode,
  language = 'javascript',
  title = 'Code Playground',
  description,
  dependencies = [],
  readOnly = false,
  showConsole = true,
  showSettings = true,
  height = '600px',
  className = ''
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode || LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]?.defaultCode || '');
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [settings, setSettings] = useState({
    autoRun: false,
    showLineNumbers: true,
    wordWrap: true,
    fontSize: 14,
    theme: 'dark'
  });
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-run when code changes (if enabled)
  useEffect(() => {
    if (settings.autoRun && code.trim()) {
      const timer = setTimeout(() => {
        runCode();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code, settings.autoRun]);

  // Scroll console to bottom when new output arrives
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [executionResult]);

  const runCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    const startTime = Date.now();
    
    try {
      // Simulate code execution (replace with actual execution logic)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const executionTime = Date.now() - startTime;
      
      // Mock execution result
      const mockResults = [
        {
          output: `Hello, World!\nFibonacci sequence:\nF(0) = 0\nF(1) = 1\nF(2) = 1\nF(3) = 2\nF(4) = 3\nF(5) = 5\nF(6) = 8\nF(7) = 13\nF(8) = 21\nF(9) = 34`,
          status: 'success' as const,
          executionTime
        },
        {
          output: 'Execution completed successfully',
          error: 'Warning: Deprecated function used on line 5',
          status: 'warning' as const,
          executionTime
        },
        {
          output: '',
          error: 'SyntaxError: Unexpected token on line 3',
          status: 'error' as const,
          executionTime
        }
      ];
      
      const result = mockResults[Math.floor(Math.random() * mockResults.length)];
      setExecutionResult(result);
      
    } catch (error) {
      setExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        executionTime: Date.now() - startTime
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setExecutionResult({
      output: 'Execution stopped by user',
      status: 'warning',
      executionTime: 0
    });
  };

  const resetCode = () => {
    const defaultCode = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]?.defaultCode || '';
    setCode(defaultCode);
    setExecutionResult(null);
  };

  const downloadCode = () => {
    const config = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS];
    const filename = `playground.${config?.extension || 'txt'}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Code Playground',
          text: 'Check out this code!',
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Terminal className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]?.name || language}
              </Badge>
              
              {dependencies.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {dependencies.length} deps
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={isRunning ? stopExecution : runCode}
                disabled={readOnly}
                className="gap-2"
                variant={isRunning ? "destructive" : "default"}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={resetCode}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={downloadCode}>
                <Download className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={shareCode}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            {showSettings && (
              <Select value={language} onValueChange={() => {}}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_CONFIGS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <Tabs defaultValue="code" className="h-full flex flex-col">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code" className="gap-2">
                  <Code2 className="w-4 h-4" />
                  Code
                </TabsTrigger>
                {showConsole && (
                  <TabsTrigger value="console" className="gap-2">
                    <Terminal className="w-4 h-4" />
                    Console
                    {executionResult && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {executionResult.status}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                {showSettings && (
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            
            <TabsContent value="code" className="flex-1 m-0 p-6 pt-4">
              <div className="h-full border rounded-lg overflow-hidden bg-slate-900">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  readOnly={readOnly}
                  className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-sm resize-none focus:outline-none"
                  style={{ 
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: 1.5,
                    whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre'
                  }}
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </div>
            </TabsContent>
            
            {showConsole && (
              <TabsContent value="console" className="flex-1 m-0 p-6 pt-4">
                <div className="h-full border rounded-lg overflow-hidden bg-slate-900">
                  <div className="p-3 border-b border-slate-700 bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">Console Output</span>
                      </div>
                      {executionResult && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {getStatusIcon(executionResult.status)}
                          <span>{executionResult.executionTime}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ScrollArea className="h-full">
                    <div ref={consoleRef} className="p-4 font-mono text-sm">
                      <AnimatePresence>
                        {executionResult ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {executionResult.output && (
                              <div className="text-slate-100 whitespace-pre-wrap mb-2">
                                {executionResult.output}
                              </div>
                            )}
                            {executionResult.error && (
                              <div className={`whitespace-pre-wrap ${
                                executionResult.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {executionResult.error}
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <div className="text-slate-500 italic">
                            Run your code to see the output here...
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            )}
            
            {showSettings && (
              <TabsContent value="settings" className="flex-1 m-0 p-6 pt-4">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Editor Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-run">Auto-run code</Label>
                        <Switch
                          id="auto-run"
                          checked={settings.autoRun}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, autoRun: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="line-numbers">Show line numbers</Label>
                        <Switch
                          id="line-numbers"
                          checked={settings.showLineNumbers}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, showLineNumbers: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="word-wrap">Word wrap</Label>
                        <Switch
                          id="word-wrap"
                          checked={settings.wordWrap}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, wordWrap: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select 
                        value={settings.fontSize.toString()} 
                        onValueChange={(value) => 
                          setSettings(prev => ({ ...prev, fontSize: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[12, 14, 16, 18, 20].map(size => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dependencies</h3>
                    {dependencies.length > 0 ? (
                      <div className="space-y-2">
                        {dependencies.map((dep, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-mono text-sm">{dep}</span>
                            <Badge variant="outline">installed</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No dependencies required</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}