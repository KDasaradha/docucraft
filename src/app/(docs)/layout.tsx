
import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import AppFooter from '@/components/layout/AppFooter'; 
import { getNavigation } from '@/lib/docs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils'; // For dynamic class names

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems = await getNavigation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebar navigationItems={navigationItems} />
          {/* Apply dynamic padding to ScrollArea based on sidebar state (handled by CSS in Sidebar component) */}
          <ScrollArea 
            className={cn(
              "flex-1 transition-all duration-200 ease-in-out",
              "md:ml-[var(--sidebar-width)] group-data-[sidebar-state=collapsed]/sidebar-wrapper:md:ml-[var(--sidebar-width-icon)]" // Simplified logic, relies on group data attribute if SidebarProvider sets it.
                                                                                                                                    // Or use a client component to read sidebar state and apply style if more complex logic is needed.
                                                                                                                                    // For now, assuming CSS variables from Sidebar component correctly define its width and this can be static.
            )}
            // The actual padding adjustment for the main content might be better handled by making the main content area aware of the sidebar's width.
            // The sidebar itself is 'fixed', so the main content needs to have a margin-left equal to the sidebar's width.
            // This can be done via a class on the main content area that changes based on sidebar state, or more simply,
            // if the sidebar width is controlled by CSS variables, these can be used.
            style={{ paddingLeft: "var(--sidebar-actual-width, 0px)" } as React.CSSProperties} // Placeholder for actual dynamic width
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
