"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Search, Loader2, AlertCircle, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { performSearch } from "@/app/actions/searchActions";
import MarkdownRenderer from "@/components/docs/MarkdownRenderer"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: { results: string[]; error?: string; query?: string, isLoading?: boolean } = {
  results: [],
  error: undefined,
  query: undefined,
  isLoading: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2 shrink-0 sm:w-auto w-full">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
      Search
    </Button>
  );
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, formAction, isPending] = useActionState(performSearch, initialState);
  const [localQuery, setLocalQuery] = useState('');
  
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (isOpen) {
      setLocalQuery(''); 
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }

      if (e.key === "Escape" && isOpen) {
         e.preventDefault();
         setIsOpen(false);
         setLocalQuery('');
      }
    };

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
    };
  }, [isOpen]); // Added isOpen dependency to re-bind Escape if dialog opens by click

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  };

  const getResultsContent = () => {
    if (isPending) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Searching for &quot;{localQuery}&quot;...</p>
        </div>
      );
    }
    if (formState?.error && formState.query === localQuery && localQuery !== "") {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      );
    }
    if (formState?.results && formState.results.length > 0 && formState.query === localQuery && localQuery !== "") {
      return (
        <ul className="space-y-3">
          {formState.results.map((result, index) => (
            <li key={index} className="p-3 border rounded-md shadow-sm bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <FileText className="h-4 w-4 mt-1 text-primary shrink-0" />
                <MarkdownRenderer content={result} className="text-sm prose-sm dark:prose-invert max-w-full prose-p:my-1 prose-headings:my-2" />
              </div>
            </li>
          ))}
        </ul>
      );
    }
    if (formState?.query === localQuery && formState.results && formState.results.length === 0 && !formState.error && localQuery !== "") {
       return (
        <div className="text-center text-muted-foreground py-8">
          <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/70" />
          <p className="font-medium">No results found for &quot;{formState.query}&quot;.</p>
          <p className="text-sm">Try using different or more general keywords.</p>
        </div>
      );
    }
    return (
      <div className="text-center text-muted-foreground py-8">
          <Info className="h-10 w-10 mx-auto mb-3 text-muted-foreground/70" />
          <p className="font-medium">Search the documentation</p>
          <p className="text-sm">Find information quickly by typing keywords above.</p>
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative h-9 w-full justify-start rounded-md text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
          <Search className="h-4 w-4 mr-2 shrink-0" />
          <span className="hidden lg:inline-flex truncate">Search documentation...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Search Documentation</DialogTitle>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="p-4 border-b">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full items-stretch sm:items-center">
            <div className="flex-1 flex items-center">
              <Search className="h-5 w-5 text-muted-foreground shrink-0 mr-2 sm:block hidden" />
              <Input
                ref={inputRef}
                type="search"
                name="query"
                placeholder="e.g., API Reference, Getting Started..."
                className="flex-1 h-10 border-0 shadow-none focus-visible:ring-0 text-base w-full"
                value={localQuery}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>
            <SubmitButton />
          </div>
        </form>
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 min-h-[200px]"> 
            {getResultsContent()}
          </div>
        </ScrollArea>
        
      </DialogContent>
    </Dialog>
  );
}
