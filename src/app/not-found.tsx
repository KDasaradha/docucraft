// src/app/not-found.tsx
"use client"

import { useEffect, useState } from 'react';
import { siteConfig } from '@/config/site.config';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, AlertTriangle } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import MarkdownRenderer from '@/components/docs/MarkdownRenderer';

// Placeholder for custom 404 content - in a real app, this might be fetched
const defaultNotFoundContent = `
# 🚧 404 - Page Not Found 🚧

It seems you've taken a wrong turn, or perhaps this page has wandered off into the digital wilderness.

## What happened?

*   The page you were looking for might have been moved or deleted.
*   You might have typed the URL incorrectly.
*   There might be a broken link.

## What can you do?

*   **Double-check the URL** for any typos.
*   Go back to the [**Homepage**](/).
*   Use the **search bar** at the top to find what you're looking for.
*   If you believe this page should exist, please [let us know](mailto:${siteConfig.social.find(s => s.name === 'Email')?.link || 'support@example.com'}).

We apologize for the inconvenience!
`;

export default function NotFound() {
  const [customContent, setCustomContent] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState<string>("Page Not Found");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustom404() {
      setIsLoading(true);
      const custom404Path = siteConfig.error_pages['404_page'];
      if (custom404Path) {
        setCustomContent(defaultNotFoundContent); 
        setDocTitle("Page Not Found - Custom Content Placeholder");
      } else {
        setCustomContent(defaultNotFoundContent);
        setDocTitle("Page Not Found");
      }
      setIsLoading(false);
    }
    
    loadCustom404();
  }, []);

  return (
    <SidebarProvider defaultOpen={true} collapsible="resizable" initialSidebarWidth="16rem"> 
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader /> 
        <div 
          className="flex flex-1 flex-col items-center justify-center px-4 py-12 pt-[calc(var(--header-height)+2rem)] text-center"
        >
          {isLoading ? (
            <div className="container max-w-3xl space-y-6">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-36 mx-auto" />
            </div>
          ) : (
            <>
              <div className="mb-8">
                 <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
              </div>
              <main className="container max-w-3xl">
                {customContent && <MarkdownRenderer content={customContent} />}
                <div className="mt-12">
                  <Button asChild variant="default" size="lg">
                    <Link href="/">
                      <Home className="mr-2 h-5 w-5" />
                      Go to Homepage
                    </Link>
                  </Button>
                </div>
              </main>
            </>
          )}
        </div>
        <AppFooter />
      </div>
    </SidebarProvider>
  );
}
