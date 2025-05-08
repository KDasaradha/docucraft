
'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from '@/config/site.config'; // Import siteConfig

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[HomePage] Initializing redirect sequence...');
    async function fetchFirstPathAndRedirect() {
      try {
        const res = await fetch('/api/first-doc-path');
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[HomePage] API error: ${res.status}`, errorText);
          throw new Error(`Failed to fetch first doc path, status: ${res.status}`);
        }
        const data = await res.json();
        
        if (data.path && data.path !== '/') { // Ensure path is not just root
          console.log(`[HomePage] API returned path: ${data.path}`);
          setTargetPath(data.path); 
        } else {
          // Fallback if API returns no path or just '/'
          const defaultDocPath = '/docs/introduction'; // Default to introduction
          console.warn(`[HomePage] API did not return a valid path or returned root, using default ${defaultDocPath}.`);
          setTargetPath(defaultDocPath); 
        }
      } catch (e: any) {
        console.error("[HomePage] Failed to get first doc path, redirecting to default.", e);
        setError(e.message || "Unknown error fetching path.");
        const defaultDocPath = '/docs/introduction'; // Default to introduction on error
        setTargetPath(defaultDocPath); 
      } finally {
        setLoading(false);
      }
    }
    fetchFirstPathAndRedirect();
  }, []);


  useEffect(() => {
    if (targetPath && !loading) { 
      console.log(`[HomePage] Attempting to redirect to: ${targetPath}`);
      router.replace(targetPath);
    }
  }, [targetPath, router, loading]);

  if (loading) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 bg-background">
        <img src={siteConfig.assets.logo} alt={`${siteConfig.name} Logo`} className="h-20 w-20 mb-4 animate-pulse" data-ai-hint="toothless dragon" />
        <Skeleton className="h-12 w-3/4 max-w-md" />
        <Skeleton className="h-8 w-1/2 max-w-sm" />
        <p className="text-lg text-muted-foreground">Loading {siteConfig.name}...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
        <img src={siteConfig.assets.logo} alt={`${siteConfig.name} Logo`} className="h-16 w-16 mb-4" data-ai-hint="toothless dragon" />
        <h1 className="text-2xl font-bold text-destructive mb-4">Redirection Error</h1>
        <p className="text-muted-foreground mb-2">Could not determine the initial documentation page.</p>
        <p className="text-sm text-destructive-foreground bg-destructive p-2 rounded-md max-w-md">{error}</p>
        <p className="mt-4 text-muted-foreground">Redirecting to a default page shortly...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <img src={siteConfig.assets.logo} alt={`${siteConfig.name} Logo`} className="h-20 w-20 mb-4" data-ai-hint="toothless dragon" />
      <p className="text-lg text-muted-foreground">Preparing to redirect you to {siteConfig.name}...</p>
    </div>
  ); 
}
