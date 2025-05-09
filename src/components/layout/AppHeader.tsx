"use client"; // Add "use client" directive

import React, { useState, useEffect } from 'react'; // Import React and hooks
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { SearchDialog } from '@/components/search/SearchDialog';
import { SidebarTrigger } from "@/components/ui/sidebar"; // Corrected import path if needed

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ height: 'var(--header-height)' } as React.CSSProperties} 
    >
      <div className="container flex h-full items-center max-w-full px-4 sm:px-6 lg:px-8">
        {mounted && ( // Only render SidebarTrigger on client after mount
          <div className="md:hidden mr-2">
            <SidebarTrigger />
          </div>
        )}
        <div className="hidden md:block">
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
