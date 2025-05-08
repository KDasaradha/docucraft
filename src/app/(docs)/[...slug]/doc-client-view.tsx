
'use client';

import { notFound, useRouter } from 'next/navigation';
import { type DocResult } from '@/lib/docs';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveDocumentContent } from '@/app/actions/docsActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit3, XCircle, Save, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type DocClientViewProps = {
  initialDoc: DocResult;
  params: { slug: string[] };
  prevDoc?: { href: string; title: string } | null;
  nextDoc?: { href: string; title: string } | null;
};

export default function DocClientView({ initialDoc, params, prevDoc, nextDoc }: DocClientViewProps) {
  const [doc, setDoc] = useState<DocResult | null>(initialDoc);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false); 
  const [isEditing, setIsEditing] = useState(isEditing);
  const [editableContent, setEditableContent] = useState(initialDoc.content);
  const [isSaving, startSaveTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setDoc(initialDoc);
    setEditableContent(initialDoc.content);
    setIsEditing(false); 
    setIsLoadingDoc(false);
  }, [initialDoc]);

  if (isLoadingDoc) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (!doc) {
    notFound();
    return null; 
  }
  
  const handleSave = async () => {
    if (!doc) return;
    startSaveTransition(async () => {
      const result = await saveDocumentContent(doc.filePath, editableContent);
      if (result.success) {
        toast({
          title: 'Document Saved',
          description: `"${result.updatedTitle || doc.title}" has been updated.`,
        });
        setIsEditing(false);
        // Instead of router.refresh(), navigate to the current path to re-fetch server components
        // This ensures prev/next links are also updated if structure changed.
        router.push(`/docs/${params.slug.join('/')}`); 
        router.refresh(); // Still good for client-side state updates like search dialogs etc.
      } else {
        toast({
          title: 'Error Saving Document',
          description: result.error || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCancel = () => {
    if (!doc) return;
    setEditableContent(doc.content);
    setIsEditing(false);
  };

  return (
    <article className="w-full">
      <header className="mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{doc.title}</h1>
                {doc.description && <p className="mt-3 text-lg text-muted-foreground">{doc.description}</p>}
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm" className="shrink-0">
              {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
              {isEditing ? 'View Mode' : 'Edit Content'}
            </Button>
        </div>
      </header>

      {isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Editor</h2>
              <Textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                rows={20}
                className="font-mono text-sm !bg-background border-2 border-input focus:border-primary"
                disabled={isSaving}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Live Preview</h2>
              <ScrollArea className="h-[450px] border rounded-md p-4 bg-muted/30">
                <MarkdownRenderer content={editableContent} />
              </ScrollArea>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <>
          <MarkdownRenderer content={doc.content} />
          {(prevDoc || nextDoc) && (
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-stretch gap-4 border-t pt-8">
              {prevDoc ? (
                <Link 
                  href={prevDoc.href} 
                  className="flex-1 group flex items-center gap-3 text-primary p-4 rounded-lg border border-border hover:border-primary/70 hover:bg-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                  <div className="text-left">
                    <span className="text-xs text-muted-foreground block">Previous</span>
                    <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{prevDoc.title}</span>
                  </div>
                </Link>
              ) : <div className="flex-1" /> /* Placeholder for spacing */}
              
              {nextDoc ? (
                <Link 
                  href={nextDoc.href} 
                  className="flex-1 group flex items-center justify-end gap-3 text-primary p-4 rounded-lg border border-border hover:border-primary/70 hover:bg-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Next</span>
                    <span className="block font-medium text-foreground group-hover:text-primary transition-colors">{nextDoc.title}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ) : <div className="flex-1" /> /* Placeholder for spacing */}
            </div>
          )}
        </>
      )}
    </article>
  );
}
