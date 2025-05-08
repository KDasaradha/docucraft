// src/app/(docs)/[...slug]/doc-client-view.tsx

'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { saveDocumentContent } from '@/app/actions/docsActions';
import { useToast } from '@/hooks/use-toast';
import { type DocResult } from '@/lib/docs';
import { Loader2, Edit3, XCircle, Save, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // DialogClose removed as it's part of DialogContent now
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'viewer' | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Login Dialog State
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Authentication Function
  const authenticateUser = (usernameAttempt: string, passwordAttempt: string) => {
    const user = users.find(
      (u) => u.username === usernameAttempt && u.password === passwordAttempt
    );

    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      setLoginError(null);
      setIsLoginDialogOpen(false); // Close dialog after successful login
      setUsername(''); // Clear username
      setPassword(''); // Clear password
    } else {
      setLoginError('Invalid credentials');
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  const handleLogin = () => {
    authenticateUser(username, password);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setIsEditing(false); // Exit edit mode on logout
  };

  const canEdit = isAuthenticated && (userRole === 'admin' || userRole === 'editor');

  useEffect(() => {
    setDoc(initialDoc);
    setEditableContent(initialDoc.content);
    setIsEditing(false);
    setIsLoadingDoc(false);
  }, [initialDoc]);

  useEffect(() => {
    // Reset login form when dialog closes
    if (!isLoginDialogOpen) {
      setUsername('');
      setPassword('');
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

  const handleSave = async () => {
    if (!doc || !canEdit) return; // Ensure user can edit
    startSaveTransition(async () => {
      const result = await saveDocumentContent(doc.filePath, editableContent);
      if (result.success) {
        toast({
          title: 'Document Saved',
          description: `"${result.updatedTitle || doc.title}" has been updated.`,
        });
        setIsEditing(false);
        // Re-fetch data by navigating to the current path
        router.push(`/docs/${params.slug.join('/')}`);
        router.refresh(); // Refresh client-side state
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
          <div>
            {!isAuthenticated ? (
              <Button onClick={() => setIsLoginDialogOpen(true)} variant="outline" size="sm" className="shrink-0">
                Login
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Logged in as {userRole}</span>
                <Button onClick={handleLogout} variant="outline" size="sm" className="shrink-0">
                  Logout
                </Button>
                {canEdit && (
                  <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm" className="shrink-0">
                    {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
                    {isEditing ? 'View Mode' : 'Edit Content'}
                  </Button>
                )}
              </div>
            )}
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
        {/* DialogTrigger is not needed if the dialog is controlled programmatically */}
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
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && <p className="text-destructive text-sm">{loginError}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">
                Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
}
