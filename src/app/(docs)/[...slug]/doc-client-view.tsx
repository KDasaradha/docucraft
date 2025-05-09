// src/app/(docs)/[...slug]/doc-client-view.tsx

'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { saveDocumentContent, summarizeCurrentDocument } from '@/app/actions/docsActions';
import { submitFeedback } from '@/app/actions/feedbackActions';
import { useToast } from '@/hooks/use-toast';
import { type DocResult } from '@/lib/docs';
import { Loader2, Edit3, XCircle, Save, Eye, ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, FileTextIcon, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type DocClientViewProps = {
  initialDoc: DocResult;
  params: { slug: string[] };
  prevDoc?: { href: string; title: string } | null;
  nextDoc?: { href: string; title: string } | null;
};

// In-memory user database
const users = [
  { username: 'admin', password: 'password', role: 'admin' as const },
  { username: 'editor', password: 'password', role: 'editor' as const },
  { username: 'viewer', password: 'password', role: 'viewer' as const },
];

export default function DocClientView({ initialDoc, params, prevDoc, nextDoc }: DocClientViewProps) {
  const [doc, setDoc] = useState<DocResult | null>(initialDoc);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(initialDoc.content);
  const [isSaving, startSaveTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'viewer' | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState(''); // Renamed to avoid conflict with global username
  const [passwordInput, setPasswordInput] = useState(''); // Renamed to avoid conflict

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'helpful' | 'unhelpful' | null>(null);


  const authenticateUser = (usernameAttempt: string, passwordAttempt: string) => {
    const user = users.find(
      (u) => u.username === usernameAttempt && u.password === passwordAttempt
    );

    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      setLoginError(null);
      setIsLoginDialogOpen(false);
      setUsernameInput(''); 
      setPasswordInput(''); 
    } else {
      setLoginError('Invalid credentials');
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  const handleLogin = () => {
    authenticateUser(usernameInput, passwordInput);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsEditing(false); 
  };

  const canEdit = isAuthenticated && (userRole === 'admin' || userRole === 'editor');

  useEffect(() => {
    setDoc(initialDoc);
    setEditableContent(initialDoc.content);
    setIsEditing(false);
    setIsLoadingDoc(false);
    setFeedbackSubmitted(null); 
    setSummaryResult(null); 
  }, [initialDoc]);

  useEffect(() => {
    if (!isLoginDialogOpen) {
      setUsernameInput('');
      setPasswordInput('');
      setLoginError(null);
    }
  }, [isLoginDialogOpen]);

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

  const handleSave = async (isDraft: boolean = false) => {
    if (!doc || !canEdit) return;

    if (!params || !params.slug || !Array.isArray(params.slug)) {
      toast({
        title: 'Navigation Error',
        description: 'Page parameters are missing, cannot redirect after save. Please refresh the page.',
        variant: 'destructive',
      });
      console.error('DocClientView: handleSave - params or params.slug is invalid. Params:', params);
      return;
    }

    startSaveTransition(async () => {
      const result = await saveDocumentContent(doc.filePath, editableContent);
      if (result.success) {
        toast({
          title: isDraft ? 'Draft Saved (Conceptual)' : 'Document Saved',
          description: isDraft ? `"${result.updatedTitle || doc.title}" has been saved as a draft (feature in development).` : `"${result.updatedTitle || doc.title}" has been updated.`,
        });
        setIsEditing(false);
        
        const slugPath = params.slug.join('/');
        router.push(`/docs/${slugPath}`);
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
  
  const handleRegularSave = () => handleSave(false);
  const handleDraftSave = () => handleSave(true);


  const handleCancel = () => {
    if (!doc) return;
    setEditableContent(doc.content);
    setIsEditing(false);
  };

  const handleSummarize = async () => {
    if (!doc) return;
    setIsSummarizing(true);
    setSummaryResult(null);
    setIsSummaryDialogOpen(true);
    const result = await summarizeCurrentDocument(doc.content);
    if (result.success && result.summary) {
      setSummaryResult({ type: 'success', message: result.summary });
    } else {
      setSummaryResult({ type: 'error', message: result.error || 'Could not generate summary.' });
    }
    setIsSummarizing(false);
  };

  const handleFeedback = async (wasHelpful: boolean) => {
    if (!doc || feedbackSubmitted) return;
    
    const feedbackInput = {
      documentTitle: doc.title,
      documentPath: `/docs/${params.slug ? params.slug.join('/') : 'unknown'}`, 
      isHelpful: wasHelpful,
      timestamp: new Date().toISOString(),
    };

    const result = await submitFeedback(feedbackInput);
    if (result.success) {
      toast({
        title: 'Feedback Submitted',
        description: result.message,
      });
      setFeedbackSubmitted(wasHelpful ? 'helpful' : 'unhelpful');
    } else {
      toast({
        title: 'Feedback Error',
        description: result.message,
        variant: 'destructive',
      });
    }
  };


  return (
    <article className="w-full">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl break-words">{doc.title}</h1>
            {doc.description && <p className="mt-3 text-lg text-muted-foreground">{doc.description}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-start self-start md:self-auto md:justify-end gap-2 shrink-0 mt-4 md:mt-0">
            {!isAuthenticated ? (
              <Button onClick={() => setIsLoginDialogOpen(true)} variant="outline" size="sm">
                Login
              </Button>
            ) : (
              <>
                <span className="text-sm text-muted-foreground whitespace-nowrap order-first md:order-none w-full md:w-auto mb-2 md:mb-0">Logged in as {userRole}</span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
                {canEdit && (
                  <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm">
                    {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
                    {isEditing ? 'View Mode' : 'Edit Content'}
                  </Button>
                )}
              </>
            )}
            <Button onClick={handleSummarize} variant="outline" size="sm" disabled={isSummarizing}>
              {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareQuote className="mr-2 h-4 w-4" />}
              Summarize
            </Button>
          </div>
        </div>
      </header>

      {isEditing && canEdit ? (
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
            <Button onClick={handleDraftSave} variant="secondary" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={handleRegularSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <>
          <MarkdownRenderer content={doc.content} />
          
          <div className="mt-10 pt-6 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Was this page helpful?</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button 
                variant={feedbackSubmitted === 'helpful' ? "default" : "outline"} 
                size="sm" 
                onClick={() => handleFeedback(true)}
                disabled={!!feedbackSubmitted}
                className="w-full sm:w-auto"
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Helpful
              </Button>
              <Button 
                variant={feedbackSubmitted === 'unhelpful' ? "destructive" : "outline"} 
                size="sm" 
                onClick={() => handleFeedback(false)}
                disabled={!!feedbackSubmitted}
                className="w-full sm:w-auto"
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Not Helpful
              </Button>
            </div>
             {feedbackSubmitted && <p className="text-xs text-muted-foreground mt-2">Thanks for your feedback!</p>}
          </div>

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
              ) : <div className="flex-1" />}

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
              ) : <div className="flex-1" />}
            </div>
          )}
        </>
      )}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Enter your username and password to access editing features.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username-login">Username</Label>
                <Input
                  type="text"
                  id="username-login"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password-login">Password</Label>
                <Input
                  type="password"
                  id="password-login"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            </div>
            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsLoginDialogOpen(false)}>Cancel</Button>
              <Button type="submit">
                Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileTextIcon className="mr-2 h-5 w-5" /> Document Summary
            </DialogTitle>
            <DialogDescription>
              AI-generated summary for &quot;{doc?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isSummarizing && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Generating summary...</span>
              </div>
            )}
            {summaryResult && summaryResult.type === 'success' && (
              <Alert>
                <AlertDescription>{summaryResult.message}</AlertDescription>
              </Alert>
            )}
            {summaryResult && summaryResult.type === 'error' && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{summaryResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSummaryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
