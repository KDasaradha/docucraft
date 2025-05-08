
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
import { Loader2, Edit3, XCircle, Save, Eye, PencilLine } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type DocClientViewProps = {
  initialDoc: DocResult;
  params: { slug: string[] };
  editUrl: string; // Added editUrl prop
};

export default function DocClientView({ initialDoc, params, editUrl }: DocClientViewProps) {
  const [doc, setDoc] = useState<DocResult | null>(initialDoc);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
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
        router.refresh(); 
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
        {editUrl && !isEditing && (
          <div className="mt-4 text-sm">
            <Link href={editUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:text-primary/80 hover:underline">
              <PencilLine className="mr-1.5 h-4 w-4" />
              Edit this page on GitHub
            </Link>
          </div>
        )}
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
        <MarkdownRenderer content={doc.content} />
      )}
    </article>
  );
}
