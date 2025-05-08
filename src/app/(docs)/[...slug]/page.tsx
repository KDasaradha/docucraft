
'use client';

import { notFound, useRouter } from 'next/navigation';
import { getDocumentContent, type DocResult } from '@/lib/docs';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import type { Metadata } from 'next';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { saveDocumentContent } from '@/app/actions/docsActions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Edit3, XCircle, Save, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: { slug: string[] };
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   // Metadata generation needs to be adapted if getDocumentContent is client-side fetched
//   // For now, we'll keep it simple or remove if causing issues with client-side nature
//   const doc = await getDocumentContent(params.slug); // This might need adjustment for static generation
//   if (!doc) {
//     return {
//       title: 'Not Found | DocuCraft',
//       description: 'The page you are looking for does not exist.',
//     };
//   }
//   return {
//     title: `${doc.title} | DocuCraft`,
//     description: doc.description || `Documentation for ${doc.title}`,
//   };
// }


export default function DocPage({ params }: Props) {
  const [doc, setDoc] = useState<DocResult | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, startSaveTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsLoadingDoc(true);
    getDocumentContent(params.slug)
      .then((data) => {
        if (data) {
          setDoc(data);
          setEditableContent(data.content);
        } else {
          setDoc(null); // Explicitly set to null for notFound handling
        }
      })
      .catch(() => setDoc(null)) // Catch errors and treat as not found
      .finally(() => setIsLoadingDoc(false));
  }, [params.slug]);

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
        // Refresh the document content without full page reload
        const updatedDoc = await getDocumentContent(params.slug);
        if (updatedDoc) {
          setDoc(updatedDoc);
          setEditableContent(updatedDoc.content); // Ensure editable content is also fresh
        } else {
          // This case should ideally not happen if save was successful
          // but handle it defensively.
          router.refresh(); 
        }
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
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{doc.title}</h1>
          {doc.description && <p className="mt-3 text-lg text-muted-foreground">{doc.description}</p>}
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
          {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
          {isEditing ? 'View Mode' : 'Edit Content'}
        </Button>
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

// Keep generateStaticParams if SSG is still desired for build, but data fetching will be client-side
export async function generateStaticParams() {
 const { getAllMarkdownPaths: getPaths } = await import('@/lib/docs');
  const paths = await getPaths();
  return paths.map((slug) => ({
    slug,
  }));
}

export const dynamic = 'force-dynamic'; // Force dynamic rendering for edit mode to work correctly after save

// Metadata function needs to fetch data directly.
// This will run on the server for each page request if dynamic.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDocumentContent(params.slug);
  if (!doc) {
    return {
      title: 'Not Found | DocuCraft',
      description: 'The page you are looking for does not exist.',
    };
  }
  return {
    title: `${doc.title} | DocuCraft`,
    description: doc.description || `Documentation for ${doc.title}`,
  };
}
