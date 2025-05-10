// src/app/(docs)/docs-layout-client.tsx
"use client"; 

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { type NavItem } from '@/lib/docs'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DocsLayoutClientProps {
  children: ReactNode;
  navigationItems: NavItem[];
}

export default function DocsLayoutClient({ children, navigationItems }: DocsLayoutClientProps) {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, [children]); // Update path when children change

  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [children]); // Re-run animation when children change (page navigation)
  
  return (
    <SidebarProvider 
      defaultOpen={true} 
      collapsible="resizable"
      initialSidebarWidth="16rem"
    >
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          {navigationItems.length > 0 ? (
             <AppSidebarClient navigationItems={navigationItems} />
          ) : (
            <aside className={cn(
                "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
                "w-[var(--sidebar-width-default)] transition-all duration-300 ease-in-out" // Ensure default width var is used
              )}
              style={{width: 'var(--sidebar-width-default)'}} // Fallback style
            >
               <div className="h-[var(--header-height)] flex items-center justify-center p-3 border-b border-sidebar-border">
                  <div className="w-24 h-6 bg-muted rounded animate-pulse"></div>
                </div>
                <ScrollArea className="flex-1 p-2 space-y-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-9 w-full rounded-md bg-muted animate-pulse mb-1"></div>
                  ))}
                </ScrollArea>
            </aside>
          )}
          
          <ScrollArea
            className="flex-1 transition-all duration-300 ease-in-out md:ml-[var(--current-sidebar-width,var(--sidebar-width-default))]"
            id="main-content-scroll-area"
          >
            <motion.main 
              ref={mainContentRef}
              className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:px-8 lg:py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              key={currentPath} 
            >
              <AnimatePresence mode="wait"> 
                {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { key: currentPath }) : children}
              </AnimatePresence>
            </motion.main>
            <AppFooter />
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
