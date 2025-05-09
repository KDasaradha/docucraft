
import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { getNavigation } from '@/lib/docs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems = await getNavigation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          {/* AppSidebarClient handles its own fixed positioning and width */}
          <AppSidebarClient navigationItems={navigationItems} />
          
          {/* 
            The ScrollArea contains the main content. It needs a margin-left 
            that corresponds to the width of the fixed AppSidebarClient.
            This margin changes based on whether the sidebar is expanded or collapsed.
            The 'group-data-[state=collapsed]/sidebar-wrapper' selector targets the
            state of the SidebarProvider's wrapper div.
            The transition duration matches the sidebar's own transition.
          */}
          <ScrollArea
            className={cn(
              "flex-1 transition-all duration-200 ease-in-out", 
              // Default margin for expanded sidebar on medium screens and up
              "md:ml-[var(--sidebar-width)]",
              // Overridden margin for collapsed sidebar on medium screens and up, using group selector
              "group-data-[state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)]"
            )}
          >
            <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
              {children}
            </main>
            <AppFooter />
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
