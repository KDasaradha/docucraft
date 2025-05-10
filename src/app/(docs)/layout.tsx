
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
    <SidebarProvider 
      defaultOpen={true} 
      collapsible="resizable" // Enable resizable sidebar for desktop
      initialSidebarWidth="16rem" // Set initial/default expanded width
    >
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebarClient navigationItems={navigationItems} />
          
          <ScrollArea
            className="flex-1 transition-all duration-200 ease-in-out"
            style={{
              // This style ensures the main content area respects the current sidebar width.
              // --current-sidebar-width is dynamically updated by SidebarProvider.
              // For mobile (offcanvas), it's 0px.
              // For desktop collapsed, it's --sidebar-width-icon.
              // For desktop expanded/resized, it's the current dynamic --sidebar-width.
              marginLeft: 'var(--current-sidebar-width, var(--sidebar-width-default))'
            } as React.CSSProperties}
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

