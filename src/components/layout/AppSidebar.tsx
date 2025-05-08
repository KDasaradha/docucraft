"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/docs";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar, 
} from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/Logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useCallback } from 'react';

interface AppSidebarProps {
  navigationItems: NavItem[];
}

interface RecursiveNavItemProps {
  item: NavItem;
  pathname: string;
  level: number;
  openSections: Record<string, boolean>;
  toggleSection: (href: string) => void;
  closeMobileSidebar?: () => void; 
}

function RecursiveNavItem({ item, pathname, level, openSections, toggleSection, closeMobileSidebar }: RecursiveNavItemProps) {
  // More robust active check: exact match or parent path match
  const isActivePath = pathname === item.href || (pathname.startsWith(item.href) && pathname.charAt(item.href.length) === '/');
  const isSectionOpen = openSections[item.href] ?? isActivePath; // Keep section open if active child

  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (item.items && item.items.length > 0) {
      e.preventDefault();
      toggleSection(item.href);
    } else {
      if (closeMobileSidebar) closeMobileSidebar(); 
    }
  };

  const itemContent = (
    <>
      <span className="truncate">{item.title}</span>
      {item.items && item.items.length > 0 && (
        isSectionOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />
      )}
    </>
  );

  const buttonClassName = cn(
    "justify-between w-full text-left h-auto py-2", // Ensure buttons can wrap text if needed
    isActivePath && !item.items?.length && "bg-sidebar-accent text-sidebar-accent-foreground font-medium", // Active style only for actual pages
    (isActivePath && item.items?.length && isSectionOpen) && "text-sidebar-primary font-medium", // Style for open active sections
    level > 0 && `pl-${level * 2 + 3}` // Adjusted padding for visual hierarchy
  );

  if (item.items && item.items.length > 0) {
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          onClick={handleToggleOrNavigate}
          className={buttonClassName}
          aria-expanded={isSectionOpen}
        >
          {itemContent}
        </SidebarMenuButton>
        {isSectionOpen && (
          <SidebarMenu className="py-1 pl-0 border-l-0 ml-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:pl-0">
            {item.items.map((subItem) => (
              <RecursiveNavItem
                key={subItem.href}
                item={subItem}
                pathname={pathname}
                level={level + 1}
                openSections={openSections}
                toggleSection={toggleSection}
                closeMobileSidebar={closeMobileSidebar}
              />
            ))}
          </SidebarMenu>
        )}
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem key={item.href}>
      <Link href={item.href} legacyBehavior passHref>
        <SidebarMenuButton
          asChild
          isActive={isActivePath}
          className={buttonClassName}
          onClick={closeMobileSidebar} 
        >
          <a>{itemContent}</a>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export default function AppSidebar({ navigationItems }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile, state: sidebarState } = useSidebar();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  const recursivelyFindAndOpenPath = useCallback((items: NavItem[], currentPath: string, openSectionsToSet: Record<string, boolean>) => {
    for (const item of items) {
      if (item.href && currentPath.startsWith(item.href) && (currentPath === item.href || currentPath.charAt(item.href.length) === '/')) {
        if (item.items && item.items.length > 0) {
          openSectionsToSet[item.href] = true;
          recursivelyFindAndOpenPath(item.items, currentPath, openSectionsToSet);
        }
      }
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const newOpenSections: Record<string, boolean> = {};
    recursivelyFindAndOpenPath(navigationItems, pathname, newOpenSections);
    setOpenSections(prev => ({...prev, ...newOpenSections}));
  }, [pathname, navigationItems, recursivelyFindAndOpenPath]);


  const toggleSection = (href: string) => {
    setOpenSections(prev => ({ ...prev, [href]: !prev[href] }));
  };
  
  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  if (!isClient) {
    return (
      <aside className="fixed top-[var(--header-height)] left-0 z-40 hidden md:block w-[var(--sidebar-width)] border-r bg-sidebar text-sidebar-foreground h-[calc(100vh-var(--header-height))]">
        <div className="p-4"><Logo collapsed={sidebarState === 'collapsed'} /></div>
        <div className="p-2 space-y-1">
          {[...Array(5)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
        </div>
      </aside>
    );
  }


  return (
      <Sidebar collapsible="icon" className="fixed top-[var(--header-height)] left-0 z-30 h-[calc(100vh-var(--header-height))] border-r">
        <SidebarHeader className={cn("p-2 py-3 items-stretch", sidebarState === 'collapsed' ? "justify-center" : "")}>
            <Logo collapsed={sidebarState === 'collapsed'} className="py-0 px-0"/>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <SidebarMenu className={cn("p-2", sidebarState === 'collapsed' ? "items-center" : "")}>
              {navigationItems.map((item) => (
                <RecursiveNavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  level={0}
                  openSections={openSections}
                  toggleSection={toggleSection}
                  closeMobileSidebar={closeMobileSidebar}
                />
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
  );
}
