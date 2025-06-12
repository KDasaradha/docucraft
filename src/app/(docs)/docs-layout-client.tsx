// src/app/(docs)/docs-layout-client.tsx
'use client'; // Mark this component as a Client Component

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import KeyboardShortcuts from '@/components/shared/KeyboardShortcuts';
import ReadingProgress from '@/components/shared/ReadingProgress';
import type { NavItem } from '@/lib/docs';
import React from 'react'; // Ensure React is imported for React.isValidElement etc.

export default function DocsLayoutClient({ children, navigationItems }: { children: ReactNode; navigationItems: NavItem[] }) {
  const pathname = usePathname();
  const currentPath = pathname || ""; // Ensure currentPath is always a string for the key

  return (
    <ErrorBoundary>
      <SidebarProvider
        defaultOpen={true}
        collapsible="resizable"
        initialSidebarWidth="16rem"
      >
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <ReadingProgress />
          <AppHeader />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebarClient navigationItems={navigationItems} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea
                className="flex-1 h-full"
                id="main-content-scroll-area"
              >
                <motion.main
                  key={currentPath} // Add key here to re-trigger animation on path change
                  className="container mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12 prose prose-slate dark:prose-invert prose-headings:scroll-mt-20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ErrorBoundary>
                    <AnimatePresence mode="wait">
                      {/*
                        Ensure children has a unique key if its identity changes across routes.
                        The key on motion.main driven by pathname usually handles page transitions.
                      */}
                      {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { key: currentPath }) : children}
                    </AnimatePresence>
                  </ErrorBoundary>
                </motion.main>
                <AppFooter />
              </ScrollArea>
            </div>
          </div>
          <KeyboardShortcuts />
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
