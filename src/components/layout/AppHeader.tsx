"use client"; 

import React from 'react'; 
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; 
import { cn } from '@/lib/utils';

export default function AppHeader() {
  const { isMobile } = useSidebar(); // Get isMobile state from context

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-60",
        "bg-[hsl(var(--header-background))] text-[hsl(var(--header-foreground))]" 
      )}
      style={{ height: 'var(--header-height)' } as React.CSSProperties} 
    >
      <div className="container flex h-full items-center max-w-full px-4 sm:px-6 lg:px-8">
        {/* Conditionally render SidebarTrigger based on isMobile state */}
        {isMobile === true && ( 
          <div className="md:hidden mr-2"> {/* md:hidden ensures CSS also hides it on larger screens */}
            <SidebarTrigger />
          </div>
        )}
        <div className={cn(isMobile === true ? "ml-2" : "", "hidden md:block")}> {/* Adjust logo margin if trigger is present */}
         <Logo className="py-0 px-0" />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
