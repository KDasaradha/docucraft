// src/components/layout/AppSidebarClient.tsx
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  SheetClose, 
} from '@/components/ui/sidebar';
import { Sheet, SheetContent as MobileSheetContent, SheetTitle } from "@/components/ui/sheet"; // Actual SheetContent and SheetTitle for mobile
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
  initialOpen?: boolean;
}

const menuItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

const subMenuVariants = {
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }
};

const normalizePath = (p: string): string => {
  let normalized = p.replace(/\/(index|_index)$/, '');
  if (normalized.endsWith('/') && normalized !== '/docs') { 
    normalized = normalized.slice(0, -1);
  }
  return normalized || '/docs'; 
};


const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ item, level, isCollapsed, currentPath, onLinkClick, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { isMobile } = useSidebar();
  
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
  // A folder link is an item that has a path, is not an external link, and is not an anchor link.
  const isFolderLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#') && !item.isExternal;
  // A pure section header is a top-level section that doesn't navigate and has no sub-items, or if it's on mobile.
  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!isCollapsed || isMobile);
  // A sub-section header is a section within a sub-menu that doesn't navigate.
  const isSubSectionHeader = item.isSection && level > 0 && !isFolderLink && !hasSubItems;


  if (isPureSectionHeader || isSubSectionHeader) {
    return (
      <div 
        className={cn(
          "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
          isSubSectionHeader && "pt-3 text-sidebar-foreground/60" // Slightly different styling for sub-sections
        )}
      >
        {item.title}
      </div>
    );
  }
  
  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems) {
      setIsOpen(!isOpen);
      // If it's a section header that only toggles, prevent default navigation.
      if (item.isSection && !isFolderLink) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // If it's a direct link (not just a toggle-only section header), or if it is a folder link,
    // then call onLinkClick (which closes mobile menu).
    if (!item.isSection || isFolderLink) {
      onLinkClick();
    }
  };
  
  const itemTitleContent = (
    <>
      <span className={cn(
        "truncate flex-grow",
        item.isSection && level === 0 && "font-semibold text-sm",
      )}>{item.title}</span>
      {item.isExternal && !isCollapsed && (
        <ExternalLink className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && (!isCollapsed || isMobile ) && (
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }} className="ml-auto">
           <ChevronDown className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        </motion.div>
      )}
    </>
  );

  const commonLinkProps = {
    href: item.href || '#', 
    target: item.isExternal ? '_blank' : undefined,
    rel: item.isExternal ? 'noopener noreferrer' : undefined,
  };

  const buttonContent = (
    <SidebarMenuButton
      onClick={handleToggleOrNavigate}
      tooltip={isCollapsed ? item.title : undefined}
      aria-expanded={isOpen}
      isActive={itemIsActive} 
      level={level}
      hasSubItems={hasSubItems}
      isOpen={isOpen} // Pass isOpen for Chevron icon
    >
      {itemTitleContent}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem>
      {item.href && !item.isExternal && !item.href.startsWith('#') ? (
        <Link {...commonLinkProps} passHref legacyBehavior>
          {buttonContent}
        </Link>
      ) : (
        buttonContent 
      )}
      {(!isCollapsed || isMobile) && hasSubItems && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <SidebarMenuSub>
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={`${subItem.href || subItem.title}-${index}`} 
                  item={subItem}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  currentPath={currentPath}
                  onLinkClick={onLinkClick}
                  initialOpen={subItem.href && currentPath.startsWith(normalizePath(subItem.href))} 
                />
              ))}
            </SidebarMenuSub>
          )}
        </AnimatePresence>
      )}
    </SidebarMenuItem>
  );
};


export default function AppSidebarClient({ navigationItems }: AppSidebarClientProps) {
  const { isMobile, openMobile, setOpenMobile, isResizing, state: sidebarState, collapsible } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof isMobile === 'boolean') {
      if (navigationItems && navigationItems.length > 0) {
        setIsLoading(false);
      } else {
        const timer = setTimeout(() => setIsLoading(false), 150); 
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
    <SidebarMenu> 
      {navigationItems.map((item, index) => (
        <RecursiveNavItem
          key={`${item.href || item.title}-${index}`}
          item={item}
          level={0}
          isCollapsed={isCollapsed}
          currentPath={pathname}
          onLinkClick={handleLinkClick}
          initialOpen={item.href && pathname.startsWith(normalizePath(item.href))}
        />
      ))}
    </SidebarMenu>
  );
  
  const sidebarSkeleton = (
    <div className={cn("p-2 space-y-0.5", isCollapsed && "px-1.5")}>
      {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showText={!isCollapsed} />)}
    </div>
  );

  const sidebarStructure = (
    <>
      <SidebarHeader className={cn(isMobile && "justify-between")}>
        <Logo collapsed={isCollapsed && !isMobile} className={cn(isCollapsed && !isMobile ? "" : "ml-1", "transition-all duration-300")} />
        {isMobile && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        )}
      </SidebarHeader>
      <SidebarContent className={cn("flex-1 overflow-y-auto", isResizing && "!cursor-ew-resize")}>
        {isLoading ? sidebarSkeleton : sidebarMenuContent}
      </SidebarContent>
    </>
  );

  if (isMobile === undefined) { // SSR or initial client render before hydration
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        "w-[var(--sidebar-width)]" 
      )}>
         <SidebarHeader className={cn("p-3 border-b border-sidebar-border flex items-center")}>
          <Logo collapsed={false} /> {/* Show expanded logo for skeleton */}
        </SidebarHeader>
        <ScrollArea className="flex-1">
          {sidebarSkeleton}
        </ScrollArea>
      </aside>
    );
  }
  
  if (isMobile) {
    return (
      <RadixSheet open={openMobile} onOpenChange={setOpenMobile}>
        {/* SheetTrigger is rendered in AppHeader */}
        <MobileSheetContent side="left" className="p-0 flex flex-col w-[var(--sidebar-width)]">
          <SheetTitle className="sr-only">Main Menu</SheetTitle> {/* For accessibility */}
          {sidebarStructure}
        </MobileSheetContent>
      </RadixSheet>
    );
  }

  return (
    <DesktopSidebar 
      variant="sidebar" 
      className={cn("fixed top-[var(--header-height)] bottom-0 left-0 z-30")}
      collapsibleType={collapsible} // Pass the collapsible type from context
    >
      {sidebarStructure}
    </DesktopSidebar>
  );
}
```
