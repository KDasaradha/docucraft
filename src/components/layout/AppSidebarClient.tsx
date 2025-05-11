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
import { SheetContent as MobileSheetContent, SheetTitle } from "@/components/ui/sheet";
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
  const isFolderLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#') && !item.isExternal;
  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!isCollapsed || isMobile);
  const isSubSectionHeader = item.isSection && level > 0 && !isFolderLink && !hasSubItems;


  if (isPureSectionHeader || isSubSectionHeader) {
    return (
      <motion.div 
        variants={menuItemVariants}
        className={cn(
          "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
          isSubSectionHeader && "pt-3 text-sidebar-foreground/60",
          isCollapsed && !isMobile && "text-center px-1"
        )}
      >
        {isCollapsed && !isMobile && item.title.substring(0,1)}
        {(!isCollapsed || isMobile) && item.title}
      </motion.div>
    );
  }
  
  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems) {
      setIsOpen(!isOpen);
      if (item.isSection && !isFolderLink) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (!item.isSection || isFolderLink) {
      onLinkClick();
    }
  };
  
  const itemTitleContent = (
    <>
      <span className={cn(
        "truncate flex-grow",
        item.isSection && level === 0 && "font-semibold text-sm",
        isCollapsed && !isMobile && "sr-only" // Hide text visually when collapsed on desktop
      )}>{item.title}</span>
      {item.isExternal && !isCollapsed && (
        <ExternalLink className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && (!isCollapsed || isMobile ) && (
        <motion.div 
          animate={{ rotate: isOpen ? 0 : -90 }} 
          transition={{ duration: 0.2 }} 
          className={cn("ml-auto", isCollapsed && !isMobile && "hidden")} // Hide chevron when collapsed on desktop
        >
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
      tooltip={isCollapsed && !isMobile ? item.title : undefined}
      aria-expanded={isOpen}
      isActive={itemIsActive} 
      level={level}
      className={cn(isCollapsed && !isMobile && "justify-center")}
    >
      {itemTitleContent}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem 
       asChild={!isCollapsed || isMobile} // Use asChild for Framer Motion on li if not collapsed desktop
       variants={menuItemVariants} // Framer Motion variants
    >
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
            <SidebarMenuSub as={motion.ul} variants={subMenuVariants} initial="closed" animate="open" exit="closed">
              {item.items?.map((subItem) => (
                <RecursiveNavItem
                  key={`${subItem.href || subItem.title}-${subItem.order}-${level}`} 
                  item={subItem}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  currentPath={currentPath}
                  onLinkClick={onLinkClick}
                  initialOpen={subItem.href ? currentPath.startsWith(normalizePath(subItem.href)) : false} 
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
    // Ensure component is mounted before accessing isMobile which relies on window
    if (typeof window !== 'undefined') {
      setIsLoading(false);
    }
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarState === "collapsed";
  
  const sidebarMenuContent = (
    <SidebarMenu className={cn(isCollapsed && "px-1.5")}> 
      {navigationItems.map((item) => (
        <RecursiveNavItem
          key={`${item.href || item.title}-${item.order}-0`} 
          item={item}
          level={0}
          isCollapsed={isCollapsed}
          currentPath={pathname}
          onLinkClick={handleLinkClick}
          initialOpen={item.href ? pathname.startsWith(normalizePath(item.href)) : false}
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
      <SidebarContent className={cn("flex-1", isResizing && "!cursor-ew-resize")}>
        {isLoading ? sidebarSkeleton : sidebarMenuContent}
      </SidebarContent>
    </>
  );

  if (isLoading) { // Show a more consistent skeleton during initial SSR/hydration checks
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        initialCollapsible === 'icon' && !defaultOpen ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]" 
      )}>
         <SidebarHeader className={cn("p-3 border-b border-sidebar-border flex items-center", initialCollapsible === 'icon' && !defaultOpen && "justify-center")}>
          <Logo collapsed={initialCollapsible === 'icon' && !defaultOpen} />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          {sidebarSkeleton}
        </ScrollArea>
      </aside>
    );
  }
  
  if (isMobile) {
    return (
        <MobileSheetContent side="left" className="p-0 flex flex-col w-[var(--sidebar-width)]">
         {/* Radix SheetTitle needs to be a direct child of SheetContent or used via SheetHeader */}
         {/* For simplicity and accessibility, we can ensure a title is present, even if visually hidden for some designs */}
          <SheetTitle className="sr-only">Main Menu</SheetTitle> {/* For accessibility */}
          {sidebarStructure}
        </MobileSheetContent>
    );
  }

  return (
    <DesktopSidebar 
      className={cn("fixed top-[var(--header-height)] bottom-0 left-0 z-30")}
      collapsibleType={collapsible} 
    >
      {sidebarStructure}
    </DesktopSidebar>
  );
}

