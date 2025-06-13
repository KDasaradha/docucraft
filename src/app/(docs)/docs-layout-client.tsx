// src/app/(docs)/docs-layout-client.tsx
'use client'; // Mark this component as a Client Component

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, Suspense } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import KeyboardShortcuts from '@/components/shared/KeyboardShortcuts';
import ReadingProgress from '@/components/shared/ReadingProgress';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NavItem } from '@/lib/docs';
import React from 'react';
import { cn } from '@/lib/utils';

// Loading component for content transitions
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading content...</p>
    </div>
  </div>
);

// Enhanced page transition variants
const pageTransition = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for smooth easing
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 1.02,
    filter: "blur(4px)",
    transition: {
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1]
    }
  }
};

// Breadcrumb component for better navigation context
const BreadcrumbNavigation = ({ pathname }: { pathname: string }) => {
  const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'docs');
  
  if (pathSegments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <a href="/docs" className="hover:text-foreground transition-colors">
            Documentation
          </a>
        </li>
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const href = `/docs/${pathSegments.slice(0, index + 1).join('/')}`;
          const title = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          return (
            <React.Fragment key={segment}>
              <li className="text-muted-foreground/50">/</li>
              <li>
                {isLast ? (
                  <span className="text-foreground font-medium" aria-current="page">
                    {title}
                  </span>
                ) : (
                  <a 
                    href={href} 
                    className="hover:text-foreground transition-colors"
                  >
                    {title}
                  </a>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

// Skip to content link for accessibility
const SkipToContent = () => (
  <a 
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
               bg-primary text-primary-foreground px-4 py-2 rounded-md 
               font-medium z-50 transition-all duration-200"
  >
    Skip to content
  </a>
);

export default function DocsLayoutClient({ 
  children, 
  navigationItems 
}: { 
  children: ReactNode; 
  navigationItems: NavItem[] 
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const currentPath = pathname || "";

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Handle loading states for better UX
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, [currentPath]);

  // Optimize sidebar behavior based on screen size
  const sidebarConfig = useMemo(() => ({
    defaultOpen: !isMobile,
    collapsible: isMobile ? "offcanvas" as const : "resizable" as const,
    initialSidebarWidth: isMobile ? "280px" : "16rem"
  }), [isMobile]);

  // Determine content container classes based on context
  const contentContainerClasses = cn(
    "main-content-container prose-enhanced content-responsive",
    // Better line height and spacing for readability
    "prose-lg:text-lg prose-lg:leading-relaxed",
    // Enhanced focus styles
    "focus-within:outline-none",
    // Professional spacing and animations
    "fade-in-up"
  );

  return (
    <ErrorBoundary>
      <SkipToContent />
      <SidebarProvider
        defaultOpen={sidebarConfig.defaultOpen}
        collapsible={sidebarConfig.collapsible}
        initialSidebarWidth={sidebarConfig.initialSidebarWidth}
      >
        <div className="flex flex-col min-h-screen bg-background text-foreground antialiased">
          {/* Reading progress and header */}
          <ReadingProgress />
          <AppHeader navigationItems={navigationItems} />
          
          {/* Main layout container with proper top spacing */}
          <div className="flex flex-1 overflow-hidden relative content-spacing">
            <AppSidebarClient navigationItems={navigationItems} />
            
            {/* Main content area with enhanced accessibility */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea
                className="flex-1 h-full"
                id="main-content-scroll-area"
              >
                {/* Main content with improved animations and layout */}
                <main 
                  id="main-content"
                  className="flex-1 focus:outline-none"
                  tabIndex={-1}
                  role="main"
                  aria-label="Main content"
                >
                  <motion.div
                    key={currentPath}
                    className={contentContainerClasses}
                    initial={prefersReducedMotion ? { opacity: 0 } : pageTransition.initial}
                    animate={prefersReducedMotion ? { opacity: 1 } : pageTransition.animate}
                    exit={prefersReducedMotion ? { opacity: 0 } : pageTransition.exit}
                    transition={prefersReducedMotion ? { duration: 0 } : undefined}
                  >
                    <ErrorBoundary>
                      {/* Breadcrumb navigation for context */}
                      <BreadcrumbNavigation pathname={currentPath} />
                      
                      {/* Content with loading states */}
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Suspense fallback={<ContentLoader />}>
                              <ContentLoader />
                            </Suspense>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={`content-${currentPath}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: prefersReducedMotion ? 0 : 0.3,
                              delay: 0.1 
                            }}
                          >
                            {React.isValidElement(children) 
                              ? React.cloneElement(children as React.ReactElement<any>, { 
                                  key: currentPath 
                                }) 
                              : children
                            }
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ErrorBoundary>
                  </motion.div>
                </main>
                
                {/* Footer */}
                <AppFooter />
              </ScrollArea>
            </div>
          </div>
          
          {/* Keyboard shortcuts overlay */}
          <KeyboardShortcuts />
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
