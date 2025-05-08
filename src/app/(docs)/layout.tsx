
import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import AppFooter from '@/components/layout/AppFooter'; // Added import
import { getNavigation } from '@/lib/docs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems = await getNavigation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebar navigationItems={navigationItems} />
          <ScrollArea className="flex-1"> 
            <main className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
              {children}
            </main>
            <AppFooter /> {/* Added AppFooter */}
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
