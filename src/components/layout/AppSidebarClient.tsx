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
  SheetTitle, 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
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
  
  const normalizePath = (p: string) => {
    let normalized = p.replace(/\/(index|_index)$/, '');
    if (normalized !== '/docs' && normalized.endsWith('/')) { 
      normalized = normalized.slice(0, -1);
    }
    return normalized || '/docs'; 
  };

  const normalizedItemHref = item.href ? normalizePath(item.href) : null;
  const normalizedCurrentPath = normalizePath(currentPath);

  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath;
  const isActiveAncestor = normalizedItemHref ? normalizedCurrentPath.startsWith(normalizedItemHref + '/') : false;
  
  // An item is considered active if it's directly active OR an ancestor of the current path and has children to expand
  const itemIsActive = isDirectlyActive || (isActiveAncestor && item.items && item.items.length > 0);


  useEffect(() => {
    // Expand if it's an active ancestor or a directly active item with children
    if ((isActiveAncestor || (isDirectlyActive && item.items && item.items.length > 0)) && !isOpen) {
      setIsOpen(true);
    }
  }, [isActiveAncestor, isDirectlyActive, item.items, isOpen]);


  const hasSubItems = item.items && item.items.length > 0;
  const isFolderLink = item.href && item.href !== '#' && !item.href.includes('#') && !item.isExternal; // Ensure not external
  
  const isPureSectionHeader = item.isSection && (!item.href || item.href.startsWith('#')) && !hasSubItems;


  if (isPureSectionHeader && level === 0 && !isCollapsed) {
    return (
      <div className={cn(
        "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
        // isCollapsed && "hidden" // Already handled by parent conditional
      )}>
        {item.title}
      </div>
    );
  }

  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems && (!isFolderLink || (item.href && item.href.startsWith('#')))) { 
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    } else if (hasSubItems && isFolderLink) { 
      setIsOpen(!isOpen); // Toggle but allow navigation via Link component
    }
    // If it's a direct link (not a folder link with # or pure toggle), onLinkClick will handle closing mobile
  };
  
  const itemTitleContent = (
    <>
      <span className={cn(
        "truncate flex-grow",
        item.isSection && level === 0 && "font-semibold text-sm",
        item.isSection && level > 0 && !isFolderLink && "font-medium opacity-80 text-xs"
      )}>{item.title}</span>
      {item.href.startsWith('http') && !isCollapsed && (
        <ExternalLink className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && !isCollapsed && (
        isOpen ? <ChevronDown className="ml-1 h-4 w-4 shrink-0" /> : <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
      )}
    </>
  );

  const commonLinkProps = {
    href: item.href || '#', // Fallback to '#' if href is undefined
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (hasSubItems && (!isFolderLink || (item.href && item.href.startsWith('#')))) {
        e.preventDefault(); 
      }
      onLinkClick(); 
    },
    target: item.href && item.href.startsWith('http') ? '_blank' : undefined,
    rel: item.href && item.href.startsWith('http') ? 'noopener noreferrer' : undefined,
  };

  // Styling for sub-section headers that are still buttons (e.g., expandable section headers)
  const subSectionHeaderStyling = item.isSection && level > 0 && !isFolderLink && "text-xs opacity-90 font-normal";

  if (hasSubItems) {
    if (isFolderLink && !(item.href && item.href.startsWith('#'))) { 
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleToggleOrNavigate}
            tooltip={isCollapsed ? item.title : undefined}
            aria-expanded={isOpen}
            asChild
            isActive={itemIsActive && !subSectionHeaderStyling} // Don't apply active style to mere sub-section headers
            className={cn(subSectionHeaderStyling)}
          >
            <Link {...commonLinkProps} onClick={onLinkClick}>
              {itemTitleContent}
            </Link>
          </SidebarMenuButton>
          {!isCollapsed && isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <RecursiveNavItem
                  key={subItem.href || subItem.title} 
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
    } else { 
      return (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleToggleOrNavigate}
            tooltip={isCollapsed ? item.title : undefined}
            aria-expanded={isOpen}
            isActive={itemIsActive && !subSectionHeaderStyling}
            className={cn(subSectionHeaderStyling)}
          >
            {itemTitleContent}
          </SidebarMenuButton>
          {!isCollapsed && isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem) => (
                <RecursiveNavItem
                  key={subItem.href || subItem.title} 
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
        tooltip={isCollapsed ? item.title : undefined}
        isActive={isDirectlyActive && !subSectionHeaderStyling} // Leaf node active state
        className={cn(subSectionHeaderStyling)}
      >
        <Link {...commonLinkProps} onClick={onLinkClick}>
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
      // If navItems is empty or undefined, treat as loaded to show empty state or fallback
      const timer = setTimeout(() => setIsLoading(false), 100); // Short delay for visual consistency
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
    const numSkeletons = 8;
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out fixed top-[var(--header-height)] bottom-0 left-0 z-40",
        isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
      )}>
         <SidebarHeader className={cn("p-3 border-b border-sidebar-border flex items-center", isCollapsed && "justify-center")}>
          <Logo collapsed={isCollapsed} className={isCollapsed ? "" : "ml-1"}/>
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5"> {/* Reduced space-y */}
            {[...Array(numSkeletons)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={!isCollapsed} />)}
          </div>
        </ScrollArea>
      </aside>
    );
  }
  
  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-40 shadow-lg md:shadow-none"
      variant="sidebar" 
    >
       <SidebarHeader className={cn(
           "p-3 border-b border-sidebar-border flex items-center justify-between", 
           isCollapsed && "justify-center"
        )}>
        <Logo collapsed={isCollapsed} className={isCollapsed ? "" : "ml-1"}/>
        {isMobile && (
          <>
            <SheetTitle className="sr-only">Main Menu</SheetTitle> 
            {/* sr-only for accessibility, actual title might be handled by Logo or not needed visually */}
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4.5 w-4.5" /> {/* Slightly larger X icon */}
                <span className="sr-only">Close menu</span>
              </Button>
            </SheetClose>
          </>
        )}
      </SidebarHeader>
      <SidebarContent asChild>
        <ScrollArea className="flex-1">
          {isLoading && isMobile ? ( 
            <div className="p-2 space-y-0.5"> {/* Reduced space-y */}
              {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon={true} />)}
            </div>
          ) : (
            <SidebarMenu className="p-2">
              {navigationItems.map((item) => (
                <RecursiveNavItem
                  key={item.href || item.title} 
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
