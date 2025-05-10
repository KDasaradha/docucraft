
'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from '@/config/site.config'; 
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFirstPathAndRedirect() {
      try {
        const res = await fetch('/api/first-doc-path');
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch first doc path, status: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        
        if (data.path && data.path !== '/') { 
          setTargetPath(data.path); 
        } else {
          const defaultDocPath = '/docs/introduction'; 
          setTargetPath(defaultDocPath); 
        }
      } catch (e: any) {
        setError(e.message || "Unknown error fetching path.");
        const defaultDocPath = '/docs/introduction'; 
        setTargetPath(defaultDocPath); 
      } finally {
        // Add a small delay to allow animation to be visible
        setTimeout(() => setLoading(false), 500); 
      }
    }
    fetchFirstPathAndRedirect();
  }, []);


  useEffect(() => {
    if (targetPath && !loading) { 
      router.replace(targetPath);
    }
  }, [targetPath, router, loading]);
  
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };


  if (loading) { 
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-background text-foreground"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.img 
          src={siteConfig.assets.logo} 
          alt={`${siteConfig.name} Logo`} 
          className="h-24 w-24 mb-4 rounded-full shadow-lg" 
          data-ai-hint="toothless dragon"
          variants={itemVariants}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 } }}
        />
        <motion.div variants={itemVariants}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
        <motion.p variants={itemVariants} className="text-xl font-medium text-muted-foreground">
          Loading {siteConfig.name}...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
     return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background text-foreground"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.img 
            src={siteConfig.assets.logo} 
            alt={`${siteConfig.name} Logo`} 
            className="h-20 w-20 mb-6 rounded-full shadow-md" 
            data-ai-hint="toothless dragon" 
            variants={itemVariants}
        />
        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-destructive mb-4">Redirection Error</motion.h1>
        <motion.p variants={itemVariants} className="text-muted-foreground mb-3 max-w-md">
            Oops! We couldn&apos;t determine the initial documentation page due to an error.
        </motion.p>
        <motion.div variants={itemVariants} className="text-sm text-destructive-foreground bg-destructive/80 p-3 rounded-md shadow max-w-md mb-6">
            {error}
        </motion.div>
        <motion.p variants={itemVariants} className="mt-4 text-muted-foreground animate-pulse">
            Attempting to redirect you to a default page shortly...
        </motion.p>
      </motion.div>
    );
  }

  // This state is very brief, mainly to allow the redirect to happen.
  // A simple loading indicator might be better than a full page if redirect is quick.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Preparing redirect...</p>
    </div>
  ); 
}
