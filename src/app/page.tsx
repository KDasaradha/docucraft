
'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";

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
        
        if (data.path) {
          console.log(`[HomePage] API returned path: ${data.path}`);
          setTargetPath(data.path); 
        } else {
          console.warn('[HomePage] API did not return a path, using default /docs/introduction.');
          setTargetPath('/docs/introduction'); 
        }
      } catch (e: any) {
        console.error("[HomePage] Failed to get first doc path, redirecting to default.", e);
        setError(e.message || "Unknown error fetching path.");
        setTargetPath('/docs/introduction'); 
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
        <Skeleton className="h-16 w-1/2 " />
        <Skeleton className="h-8 w-3/4 " />
        <Skeleton className="h-8 w-3/4 " />
        <Skeleton className="h-8 w-2/3 " />
        <p className="text-muted-foreground">Loading documentation...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Redirection Error</h1>
        <p className="text-muted-foreground mb-2">Could not determine the initial documentation page.</p>
        <p className="text-sm text-destructive-foreground bg-destructive p-2 rounded-md">{error}</p>
        <p className="mt-4">Redirecting to a default page shortly...</p>
      </div>
    );
  }

  // Should be redirecting, so theoretically this won't be seen for long.
  // If it is seen, it means the redirect isn't happening.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <p className="text-muted-foreground">Preparing to redirect...</p>
    </div>
  ); 
}
