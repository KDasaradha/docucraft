
// src/components/layout/AppSidebarClient.tsx
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  useSidebar,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { SheetTitle, SheetClose } from '@/components/ui/sheet'; // SheetTitle import is correct here
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import type { NavItem } from '@/lib/docs'; // NavItem should include isSection
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronDown, ChevronRight, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface AppSidebarClientProps {
  navigationItems: NavItem[];
}

interface RecursiveNavItemProps {
  item: NavItem;
  level: number;
  isCollapsed: boolean;
  currentPath: string;
  onLinkClick: () => void;
}

const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ item, level, isCollapsed, currentPath, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const normalizePath = (p: string) => {
    let normalized = p.replace(/\/(index|_index)$/, '');
    if (normalized !== '/docs' && normalized.endsWith('/')) { // Avoid stripping trailing slash for root /docs/
      normalized = normalized.slice(0, -1);
    }
    return normalized || '/docs'; 
  };

  const normalizedItemHref = item.href ? normalizePath(item.href) : null;
  const normalizedCurrentPath = normalizePath(currentPath);

  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath;
  const isActiveAncestor = normalizedItemHref ? normalizedCurrentPath.startsWith(normalizedItemHref + '/') : false;
  const isActive = isDirectlyActive || isActiveAncestor;

  useEffect(() => {
    if ((isActiveAncestor || (isDirectlyActive && item.items && item.items.length > 0)) && !isOpen) {
      setIsOpen(true);
    }
  }, [isActiveAncestor, isDirectlyActive, item.items, isOpen]);

  const hasSubItems = item.items && item.items.length > 0;
  const isFolderLink = item.href && item.href !== '#' && !item.href.includes('#');

  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems && (!isFolderLink || item.href.includes('#'))) { 
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    } else if (hasSubItems && isFolderLink) { 
      setIsOpen(!isOpen);
    }
  };
  
  const itemTitleContent = (
    <>
      <span className={cn(
        "truncate flex-grow",
        // Style for section headers
        item.isSection && level === 0 && "font-semibold", 
        item.isSection && level > 0 && !isFolderLink && "font-medium opacity-80" 
      )}>{item.title}</span>
      {item.href.startsWith('http') && !isCollapsed && (
        <ExternalLink className="ml-1 h-3 w-3 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && !isCollapsed && (
        isOpen ? <ChevronDown className="ml-1 h-4 w-4 shrink-0" /> : <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
      )}
    </>
  );

  const commonLinkProps = {
    href: item.href,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (hasSubItems && (!isFolderLink || item.href.includes('#'))) {
        e.preventDefault(); // Prevent navigation if it's a pure toggle or anchor link section header
      }
      onLinkClick(); 
    },
    target: item.href.startsWith('http') ? '_blank' : undefined,
    rel: item.href.startsWith('http') ? 'noopener noreferrer' : undefined,
  };

  const buttonClassName = cn(
    "w-full justify-start items-center",
    (isDirectlyActive || (isActiveAncestor && !hasSubItems)) && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
    level > 0 && !isCollapsed && `pl-${4 + level * 2}`,
    // Additional styling for section items for visual distinction
    item.isSection && level === 0 && "py-2.5 text-sm", // Top-level sections
    item.isSection && level > 0 && !isFolderLink && "text-xs opacity-90" // Sub-section headers (non-link)
  );

  if (hasSubItems) {
    if (isFolderLink && !item.href.includes('#') ) { // Folder with its own page (not an anchor)
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleToggleOrNavigate} // Will allow navigation and toggle
            className={buttonClassName}
            tooltip={isCollapsed ? item.title : undefined}
            aria-expanded={isOpen}
            asChild
          >
            <Link {...commonLinkProps} onClick={onLinkClick}> {/* onClick for mobile close, Link handles navigation */}
              {itemTitleContent}
            </Link>
          </SidebarMenuButton>
          {!isCollapsed && isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={subItem.title + '-' + index} // Use title and index for key
                  item={subItem}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  currentPath={currentPath}
                  onLinkClick={onLinkClick}
                />
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    } else { // Pure folder (href is '#' or an anchor link for a section header)
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleToggleOrNavigate} // Will only toggle
            className={buttonClassName}
            tooltip={isCollapsed ? item.title : undefined}
            aria-expanded={isOpen}
          >
            {itemTitleContent}
          </SidebarMenuButton>
          {!isCollapsed && isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={subItem.title + '-' + index} // Use title and index for key
                  item={subItem}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  currentPath={currentPath}
                  onLinkClick={onLinkClick}
                />
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }
  }

  // Leaf node (no sub-items)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={buttonClassName}
        tooltip={isCollapsed ? item.title : undefined}
      >
        <Link {...commonLinkProps} onClick={onLinkClick}> {/* onClick for mobile close, Link handles navigation */}
          {itemTitleContent}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};


export default function AppSidebarClient({ navigationItems }: AppSidebarClientProps) {
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (navigationItems && navigationItems.length > 0) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [navigationItems]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarState === 'collapsed';

  // Skeleton for non-mobile initial load
  if (isLoading && !isMobile) {
    // Determine a reasonable number of skeletons to show
    const numSkeletons = Math.min(navigationItems?.length || 8, 12); // Show up to 12, or actual length if less than 8
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out fixed top-[var(--header-height)] bottom-0 left-0 z-40",
        isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
      )}>
         <SidebarHeader className={cn("p-4 border-b border-sidebar-border flex items-center", isCollapsed && "p-2 justify-center")}>
          <Logo collapsed={isCollapsed} />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {[...Array(numSkeletons)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={!isCollapsed} />)}
          </div>
        </ScrollArea>
      </aside>
    );
  }
  
  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-40"
      variant="sidebar" // This is one of the variants defined in sidebar.tsx
    >
       <SidebarHeader className={cn("p-4 border-b border-sidebar-border flex items-center justify-between", isCollapsed && "p-2 justify-center")}>
        <Logo collapsed={isCollapsed} />
        {/* SheetTitle is part of SheetHeader in SheetContent for accessibility if needed */}
        {/* For offcanvas mobile sidebar, title is set in Sidebar component's SheetContent */}
        {isMobile && (
           <SheetClose asChild>
             <Button variant="ghost" size="icon" className="h-7 w-7">
               <X className="h-4 w-4" />
               <span className="sr-only">Close menu</span>
             </Button>
           </SheetClose>
        )}
      </SidebarHeader>
      <SidebarContent asChild>
        <ScrollArea className="flex-1">
          {isLoading && isMobile ? ( 
            <div className="p-2 space-y-1">
              {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={true} />)}
            </div>
          ) : (
            <SidebarMenu className="p-2">
              {navigationItems.map((item, index) => (
                <RecursiveNavItem
                  key={item.title + '-' + index} // Use item title and index for a unique key
                  item={item}
                  level={0}
                  isCollapsed={isCollapsed}
                  currentPath={pathname}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </SidebarMenu>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
