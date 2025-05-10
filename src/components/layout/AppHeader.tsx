// src/components/layout/AppHeader.tsx
"use client"; 

import React from 'react'; 
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; 
import { cn } from '@/lib/utils';

export default function AppHeader() {
  const { isMobile } = useSidebar(); 

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-opacity-60",
        "bg-[hsl(var(--header-background))] text-[hsl(var(--header-foreground))]" 
      )}
      style={{ height: 'var(--header-height)' } as React.CSSProperties} 
    >
      <div className="container flex h-full items-center max-w-full px-4 sm:px-6 lg:px-8">
        
        <div className="md:hidden mr-2"> 
           {/* SidebarTrigger should internally handle its visibility based on isMobile via useSidebar hook */}
           {/* Or, if SidebarTrigger doesn't use the hook, we conditionally render it here */}
           {isMobile && <SidebarTrigger />}
        </div>
        
        {/* Logo: Always render, use CSS to hide on mobile if SidebarTrigger is shown. Or adjust margins. */}
        {/* Forcing visibility with md:block and hiding with mobile specific class if needed */}
        <div className={cn("hidden md:block", isMobile ? "ml-0" : "")}> {/* Adjusted: if mobile trigger is shown, logo might need less margin or be hidden */}
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
