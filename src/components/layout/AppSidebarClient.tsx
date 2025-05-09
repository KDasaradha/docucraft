
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
import { SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Logo } from '@/components/shared/Logo';
import type { NavItem } from '@/lib/docs';
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
  
  // Normalize item.href and currentPath for consistent matching
  // Removes trailing '/index' or '/_index' and ensures no trailing slash for comparison unless it's root "/docs"
  const normalizePath = (p: string) => {
    let normalized = p.replace(/\/(index|_index)$/, '');
    if (normalized !== '/docs' && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized || '/docs'; // Ensure root path is consistent
  };

  const normalizedItemHref = item.href ? normalizePath(item.href) : null;
  const normalizedCurrentPath = normalizePath(currentPath);

  // An item is directly active if its normalized href matches the normalized current path.
  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath;
  
  // An item is an active ancestor if the current path starts with its href (for parent directories),
  // and it's not the item itself.
  const isActiveAncestor = normalizedItemHref ? normalizedCurrentPath.startsWith(normalizedItemHref + '/') : false;
  
  const isActive = isDirectlyActive || isActiveAncestor;

  useEffect(() => {
    // Auto-open if it's an active ancestor or directly active and has children
    if ((isActiveAncestor || (isDirectlyActive && item.items && item.items.length > 0)) && !isOpen) {
      setIsOpen(true);
    }
  }, [isActiveAncestor, isDirectlyActive, item.items, isOpen]);


  const hasSubItems = item.items && item.items.length > 0;
  // A folder item is considered a link if its href is not "#" and not an anchor link
  const isFolderLink = item.href && item.href !== '#' && !item.href.includes('#');

  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems && !isFolderLink) { // If it's a pure folder (no direct page), just toggle
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    } else if (hasSubItems && isFolderLink) { // If it's a folder with a page, toggle and allow navigation
      setIsOpen(!isOpen);
      // Navigation will be handled by the Link component, no e.preventDefault() here unless Link is child of Button
    }
    // If it's a leaf node or a folder link, onLinkClick will be called by the Link component
  };
  
  const itemTitleContent = (
    <>
      <span className="truncate flex-grow">{item.title}</span>
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
      // If it's a folder that only toggles, prevent default link behavior
      if (hasSubItems && !isFolderLink && item.href ==='#') {
        e.preventDefault();
      }
      onLinkClick(); // Close mobile sidebar if open
    },
    target: item.href.startsWith('http') ? '_blank' : undefined,
    rel: item.href.startsWith('http') ? 'noopener noreferrer' : undefined,
  };

  const buttonClassName = cn(
    "w-full justify-start items-center",
    (isDirectlyActive || (isActiveAncestor && !hasSubItems) ) && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold", // Highlight if directly active or an ancestor leading to a leaf
    level > 0 && !isCollapsed && `pl-${4 + level * 2}`
  );

  if (hasSubItems) {
    if (isFolderLink) { // Folder with its own page
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleToggleOrNavigate}
            className={buttonClassName}
            tooltip={isCollapsed ? item.title : undefined}
            aria-expanded={isOpen}
            asChild
          >
            <Link {...commonLinkProps}>
              {itemTitleContent}
            </Link>
          </SidebarMenuButton>
          {!isCollapsed && isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={`${subItem.href}-${index}`}
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
    } else { // Pure folder (no direct page, href likely '#')
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleToggleOrNavigate}
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
                  key={`${subItem.href}-${index}`}
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
        <Link {...commonLinkProps}>
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
      // If navigationItems is empty or not yet loaded, show skeleton for a bit
      const timer = setTimeout(() => setIsLoading(false), 300); // Increased timeout slightly
      return () => clearTimeout(timer);
    }
  }, [navigationItems]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarState === 'collapsed';

  if (isLoading && !isMobile) {
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
            {[...Array(navigationItems?.length || 8)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={!isCollapsed} />)}
          </div>
        </ScrollArea>
      </aside>
    );
  }
  
  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-40"
      variant="sidebar"
    >
       <SidebarHeader className={cn("p-4 border-b border-sidebar-border flex items-center justify-between", isCollapsed && "p-2 justify-center")}>
        <Logo collapsed={isCollapsed} />
        {isMobile && <SheetTitle className="sr-only">Navigation Menu</SheetTitle>}
        {isMobile && (
           <SheetClose asChild>
             <Button variant="ghost" size="icon" className="h-7 w-7">
               <X className="h-4 w-4" />
               <span className="sr-only">Close</span>
             </Button>
           </SheetClose>
        )}
      </SidebarHeader>
      <SidebarContent asChild>
        <ScrollArea className="flex-1">
          {isLoading && isMobile ? ( // Loading skeleton for mobile
            <div className="p-2 space-y-1">
              {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={true} />)}
            </div>
          ) : (
            <SidebarMenu className="p-2">
              {navigationItems.map((item, index) => (
                <RecursiveNavItem
                  key={`${item.href}-${index}`}
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
