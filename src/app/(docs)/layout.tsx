// src/app/(docs)/layout.tsx
import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { getNavigation, type NavItem } from '@/lib/docs';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep if main content needs it separately

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems: NavItem[] = await getNavigation();

  return (
    <SidebarProvider 
      defaultOpen={true} 
      collapsible="resizable" // Example: make it resizable
      initialSidebarWidth="16rem" // Example initial width
    >
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebarClient navigationItems={navigationItems} />
          
          {/* Main Content Area */}
          <ScrollArea 
            className="flex-1 transition-all duration-300 ease-in-out md:ml-[var(--current-sidebar-width)]"
            id="main-content-scroll-area"
            // The style with --current-sidebar-width should be applied here
            // The actual CSS variable for margin is now managed by SidebarProvider via root style vars
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
```
  </content>
  </change>
  <change>
    <file>src/components/ui/sheet.tsx</