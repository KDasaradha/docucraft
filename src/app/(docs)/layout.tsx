
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
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebarClient navigationItems={navigationItems} />
          
          <ScrollArea
            className={cn(
              "flex-1 transition-all duration-200 ease-in-out",
              // The sidebar's internal placeholder div now handles the left margin.
              // The following classes are effectively managed by the peer group selectors in sidebar.tsx
              // "md:ml-[var(--sidebar-width)]",
              // "group-data-[state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)]"
            )}
            // style={{
            //   // This is now controlled by the sibling div's width (the placeholder from Sidebar component)
            //   // marginLeft: 'var(--current-sidebar-width, var(--sidebar-width))'
            // } as React.CSSProperties}
          >
            <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:px-8 lg:py-12">
              {children}
            </main>
            <AppFooter />
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
