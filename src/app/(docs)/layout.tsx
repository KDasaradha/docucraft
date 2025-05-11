// src/app/(docs)/layout.tsx
import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { getNavigation, type NavItem } from '@/lib/docs';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation'; // This needs to be used in a client component

// Client component to handle Framer Motion and usePathname
function DocsLayoutClient({ children, navigationItems }: { children: ReactNode; navigationItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarProvider
      defaultOpen={true}
      collapsible="resizable"
      initialSidebarWidth="16rem"
    >
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebarClient navigationItems={navigationItems} />
          <ScrollArea
            className="flex-1 transition-all duration-300 ease-in-out md:ml-[var(--current-sidebar-width)]"
            id="main-content-scroll-area"
          >
            <motion.main
              key={pathname} // Add key here to re-trigger animation on path change
              className="container mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                 {/*
                  Cloning children with a key ensures AnimatePresence detects component changes.
                  However, directly cloning ReactNode children can be problematic if children is not a single element.
                  A common pattern is to wrap children if it's complex.
                  For simple page transitions, keying the motion.main is often sufficient.
                  If children itself needs to animate out/in, it might need its own motion wrapper
                  and be a direct child of AnimatePresence.
                */}
                {children}
              </AnimatePresence>
            </motion.main>
            <AppFooter />
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems: NavItem[] = await getNavigation();

  return (
    <DocsLayoutClient navigationItems={navigationItems}>
      {children}
    </DocsLayoutClient>
  );
}
