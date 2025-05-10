
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
    <SidebarProvider defaultOpen={true} initialSidebarWidth="16rem">
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebarClient navigationItems={navigationItems} />
          
          <ScrollArea
            className={cn(
              "flex-1 transition-all duration-200 ease-in-out",
              // The placeholder div inside SidebarProvider now correctly handles the left margin.
              // The margin-left will be controlled by the --current-sidebar-width CSS variable.
            )}
            style={{
              // This style ensures the main content area respects the current sidebar width.
              // The --current-sidebar-width is dynamically updated by SidebarProvider.
              // For mobile, when sidebar is offcanvas, the placeholder div itself will be hidden,
              // so this margin effectively becomes 0.
              // When sidebar is collapsed (icon only), it will use --sidebar-width-icon.
              // When sidebar is expanded/resized, it will use the current --sidebar-width.
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

