// src/components/layout/AppSidebarClient.tsx
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  // Sidebar component is now mainly for desktop <aside>
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
  RadixSheetTitle as SheetTitle, // From ui/sidebar which re-exports Radix's SheetTitle
} from '@/components/ui/sidebar';
import { SheetContent as MobileSheetContent } from "@/components/ui/sheet"; // Actual SheetContent for mobile
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
  isCollapsed: boolean; // For desktop collapsed state
  currentPath: string;
  onLinkClick: () => void; // For mobile sheet close
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
      // Allow navigation for folder links but also toggle submenu
      setIsOpen(!isOpen); 
    }
    // If it's a direct link without sub-items, or a folder link, let navigation proceed.
    // onLinkClick will handle closing mobile sheet.
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
      {hasSubItems && (!isCollapsed || useSidebar().isMobile ) && ( // Show chevrons on mobile expanded too
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
      >
        {itemTitleContent}
      </SidebarMenuButton>
  );


  if (hasSubItems) {
    return (
      <SidebarMenuItem>
        {isFolderLink && !(item.href && item.href.startsWith('#')) ? renderButtonAsLink : renderButtonDirectly}
        {(!isCollapsed || useSidebar().isMobile) && isOpen && ( // Show sub-menu on mobile if open
          <SidebarMenuSub>
            {item.items?.map((subItem, index) => (
              <RecursiveNavItem
                key={`${subItem.href || subItem.title}-${index}`} // Ensure unique key
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

  // No sub-items
  return (
    <SidebarMenuItem>
      <Link {...commonLinkProps} passHref legacyBehavior>
        <SidebarMenuButton
            onClick={onLinkClick} // Only closes sheet on mobile
            tooltip={isCollapsed ? item.title : undefined}
            isActive={isDirectlyActive && !subSectionHeaderStyling}
            className={cn(subSectionHeaderStyling)}
          >
            {itemTitleContent}
          </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
};


export default function AppSidebarClient({ navigationItems }: AppSidebarClientProps) {
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect ensures that isMobile from useSidebar context is settled before rendering
    // and helps mitigate hydration mismatches for mobile/desktop specific rendering.
    if (typeof isMobile === 'boolean') { // Check if isMobile is determined
      if (navigationItems && navigationItems.length > 0) {
        setIsLoading(false);
      } else {
        // Simulate loading if navigationItems are fetched async later, or just set to false
        const timer = setTimeout(() => setIsLoading(false), 50); // Short delay for perceived loading
        return () => clearTimeout(timer);
      }
    }
    // If isMobile is undefined, keep isLoading true until it's resolved.
  }, [navigationItems, isMobile]);


  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarState === "collapsed";
  
  const sidebarMenuContent = (
    <SidebarMenu className="p-2">
      {navigationItems.map((item, index) => (
        <RecursiveNavItem
          key={`${item.href || item.title}-${index}`} // Ensure unique key
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
      <SidebarHeader className={cn(isCollapsed && "justify-center")}>
        {isMobile && <SheetTitle className="sr-only">Main Menu</SheetTitle>}
        <Logo collapsed={isCollapsed} className={isCollapsed ? "" : "ml-1"} />
        {/* Close button is handled by RadixSheetContent now if isMobile */}
      </SidebarHeader>
      <SidebarContent>
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

  if (typeof isMobile === 'undefined' || (isLoading && isMobile === undefined)) {
     // Render a consistent skeleton for SSR and initial client render before isMobile is known
     // This should match the desktop collapsed skeleton to avoid layout shifts if it defaults to desktop first
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out fixed top-[var(--header-height)] bottom-0 left-0 z-40",
        "w-[var(--sidebar-width-icon)]" // Default to collapsed for SSR
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
    return (
      <MobileSheetContent side="left" className="p-0 flex flex-col w-[var(--sidebar-width)]">
        {sidebarStructure}
      </MobileSheetContent>
    );
  }
  
  // Desktop view
  return (
    <DesktopSidebar variant="sidebar">
      {sidebarStructure}
    </DesktopSidebar>
  );
}
