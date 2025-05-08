'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFirstPathAndRedirect() {
      try {
        const res = await fetch('/api/first-doc-path');
        if (!res.ok) throw new Error('Failed to fetch first doc path');
        const data = await res.json();
        
        if (data.path) {
          setTargetPath(data.path); 
        } else {
          setTargetPath('/docs/introduction'); 
        }
      } catch (error) {
        console.error("Failed to get first doc path, redirecting to default.", error);
        setTargetPath('/docs/introduction'); 
      } finally {
        setLoading(false);
      }
    }
    fetchFirstPathAndRedirect();
  }, []);


  useEffect(() => {
    if (targetPath && !loading) { 
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
      </div>
    );
  }

  return null; 
}
