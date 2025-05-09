
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
          {/* AppSidebarClient renders a Sidebar component which includes a placeholder div 
              that occupies space in the normal document flow. This placeholder div's width 
              adjusts based on whether the sidebar is expanded or collapsed.
          */}
          <AppSidebarClient navigationItems={navigationItems} />
          
          {/* 
            The ScrollArea contains the main content. As a flex-1 item, it will take up 
            the remaining space next to the AppSidebarClient's placeholder div.
            Explicit margins are removed as the placeholder div handles the spacing.
            The transition on the placeholder div within the Sidebar component will 
            animate the width change, and flex-1 on ScrollArea will adapt to it.
          */}
          <ScrollArea
            className={cn(
              "flex-1 transition-all duration-200 ease-in-out"
              // Removed md:ml-[var(--sidebar-width)] and 
              // group-data-[state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)]
              // The sidebar's internal placeholder div is now responsible for managing this spacing.
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

