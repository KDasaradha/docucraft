// src/components/layout/AppSidebarClient.tsx
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as DesktopSidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  useSidebar,
  SidebarMenuSkeleton,
  SheetClose, // From ui/sidebar which re-exports Radix's SheetClose
} from '@/components/ui/sidebar';
import { SheetContent as MobileSheetContent, SheetTitle } from "@/components/ui/sheet"; // Actual SheetContent and SheetTitle for mobile
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
  
  const itemIsActive = isDirectlyActive || (isActiveAncestor && item.items && item.items.length > 0);

  useEffect(() => {
    if ((isActiveAncestor || (isDirectlyActive && item.items && item.items.length > 0)) && !isOpen) {
      setIsOpen(true);
    }
  }, [isActiveAncestor, isDirectlyActive, item.items, isOpen]);


  const hasSubItems = item.items && item.items.length > 0;
  const isFolderLink = item.href && item.href !== '#' && !item.href.includes('#') && !item.isExternal; 
  
  const isPureSectionHeader = item.isSection && (!item.href || item.href.startsWith('#')) && !hasSubItems;


  if (isPureSectionHeader && level === 0 && !isCollapsed) {
    return (
      <div className={cn(
        "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
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
      setIsOpen(!isOpen); 
    }
    if(!hasSubItems || isFolderLink) {
      onLinkClick();
    }
  };
  
  const itemTitleContent = (
    <>
      <span className={cn(
        "truncate flex-grow",
        item.isSection && level === 0 && "font-semibold text-sm",
        item.isSection && level > 0 && !isFolderLink && "font-medium opacity-80 text-xs"
      )}>{item.title}</span>
      {item.href && item.href.startsWith('http') && !isCollapsed && (
        <ExternalLink className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && (!isCollapsed || useSidebar().isMobile ) && (
        isOpen ? <ChevronDown className="ml-1 h-4 w-4 shrink-0" /> : <ChevronRight className="ml-1 h-4 w-4 shrink-0" />
      )}
    </>
  );

  const commonLinkProps = {
    href: item.href || '#', 
    target: item.href && item.href.startsWith('http') ? '_blank' : undefined,
    rel: item.href && item.href.startsWith('http') ? 'noopener noreferrer' : undefined,
  };

  const subSectionHeaderStyling = item.isSection && level > 0 && !isFolderLink && "text-xs opacity-90 font-normal";

  const renderButtonAsLink = (
    <Link {...commonLinkProps} passHref legacyBehavior>
        <SidebarMenuButton
            onClick={handleToggleOrNavigate}
            tooltip={isCollapsed ? item.title : undefined}
            aria-expanded={isOpen}
            isActive={itemIsActive && !subSectionHeaderStyling} 
            className={cn(subSectionHeaderStyling)}
            hasSubItems={hasSubItems}
            isOpen={isOpen}
            level={level}
          >
            {itemTitleContent}
          </SidebarMenuButton>
    </Link>
  );
  
  const renderButtonDirectly = (
     <SidebarMenuButton
        onClick={handleToggleOrNavigate}
        tooltip={isCollapsed ? item.title : undefined}
        aria-expanded={isOpen}
        isActive={itemIsActive && !subSectionHeaderStyling}
        className={cn(subSectionHeaderStyling)}
        hasSubItems={hasSubItems}
        isOpen={isOpen}
        level={level}
      >
        {itemTitleContent}
      </SidebarMenuButton>
  );


  if (hasSubItems) {
    return (
      <SidebarMenuItem>
        {isFolderLink && !(item.href && item.href.startsWith('#')) ? renderButtonAsLink : renderButtonDirectly}
        {(!isCollapsed || useSidebar().isMobile) && isOpen && (
          <SidebarMenuSub>
            {item.items?.map((subItem, index) => (
              <RecursiveNavItem
                key={`${subItem.href || subItem.title}-${index}-${level + 1}`} 
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

  return (
    <SidebarMenuItem>
      <Link {...commonLinkProps} passHref legacyBehavior>
        <SidebarMenuButton
            onClick={onLinkClick}
            tooltip={isCollapsed ? item.title : undefined}
            isActive={isDirectlyActive && !subSectionHeaderStyling}
            className={cn(subSectionHeaderStyling)}
            level={level}
          >
            {itemTitleContent}
          </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};


export default function AppSidebarClient({ navigationItems }: AppSidebarClientProps) {
  const { state: sidebarState, isMobile, setOpenMobile, isResizing } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof isMobile === 'boolean') {
      if (navigationItems && navigationItems.length > 0) {
        setIsLoading(false);
      } else {
        const timer = setTimeout(() => setIsLoading(false), 50); 
        return () => clearTimeout(timer);
      }
    }
  }, [navigationItems, isMobile]);


  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarState === "collapsed";
  
  const sidebarMenuContent = (
    <SidebarMenu> {/* Removed p-2, handled by SidebarMenuButton's pl and px */}
      {navigationItems.map((item, index) => (
        <RecursiveNavItem
          key={`${item.href || item.title}-${index}-level0-${item.isSection}`}
          item={item}
          level={0}
          isCollapsed={isCollapsed}
          currentPath={pathname}
          onLinkClick={handleLinkClick}
        />
      ))}
    </SidebarMenu>
  );

  const sidebarStructure = (
    <>
      <SidebarHeader className={cn(isCollapsed && "justify-center", isResizing && "!cursor-ew-resize")}>
         {/* Add SheetTitle here for accessibility when it's a SheetContent */}
        {isMobile && <SheetTitle className="sr-only">Main Menu</SheetTitle>}
        <Logo collapsed={isCollapsed} className={isCollapsed ? "" : "ml-1"} />
        {isMobile && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        )}
      </SidebarHeader>
      <SidebarContent className={cn(isResizing && "!cursor-ew-resize")}>
        {isLoading && !isMobile ? (
          <div className="p-2 space-y-0.5">
            {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showText={!isCollapsed} />)}
          </div>
        ) : isLoading && isMobile ? (
            <div className="p-2 space-y-0.5">
                {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showText={true} />)}
            </div>
        ) : (
          sidebarMenuContent
        )}
      </SidebarContent>
    </>
  );

  // Initial render before isMobile is determined by the hook
  if (isMobile === undefined) {
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        "w-[var(--sidebar-width-icon)]" // Default to collapsed icon view for SSR/initial desktop
      )}>
         <SidebarHeader className={cn("p-3 border-b border-sidebar-border flex items-center justify-center")}>
          <Logo collapsed={true} />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5"> 
            {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showText={false} />)}
          </div>
        </ScrollArea>
      </aside>
    );
  }


  if (isMobile) {
    // DesktopSidebar here becomes RadixSheetContentOriginal because SidebarProvider wraps with <Sheet>
    // And Sidebar component returns RadixSheetContentOriginal when isMobile is true
    return (
      <DesktopSidebar variant="sidebar" className={cn("fixed top-0 bottom-0 left-0 z-40", isResizing && "!cursor-ew-resize")}>
          {sidebarStructure}
      </DesktopSidebar>
    );
  }
  
  // DesktopSidebar here is the <aside>
  return (
    <DesktopSidebar variant="sidebar" className={cn("fixed top-[var(--header-height)] bottom-0 left-0 z-30", isResizing && "!cursor-ew-resize")}>
      {sidebarStructure}
    </DesktopSidebar>
  );
}
    
