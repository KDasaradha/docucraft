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
} from '@/components/ui/sidebar';
import { SheetContent as MobileSheetContent, SheetTitle, SheetClose } from "@/components/ui/sheet"; 
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import type { NavItem } from '@/lib/docs'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronDown, ChevronRight, X, GripVertical } from 'lucide-react'; 
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
  hover: { backgroundColor: "hsl(var(--sidebar-accent))", color: "hsl(var(--sidebar-accent-foreground))", transition: { duration: 0.15 } },
  tap: { scale: 0.98 }
};

const subMenuVariants = {
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }
};


const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ item, level, isCollapsed, currentPath, onLinkClick, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  
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
  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!isCollapsed || useSidebar().isMobile);


  if (isPureSectionHeader) {
    return (
      <motion.div 
        variants={menuItemVariants} 
        initial="initial"
        animate="animate"
        className={cn(
        "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
      )}>
        {item.title}
      </motion.div>
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
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
           <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        </motion.div>
      )}
    </>
  );

  const commonLinkProps = {
    href: item.href || '#', 
    target: item.href && item.href.startsWith('http') ? '_blank' : undefined,
    rel: item.href && item.href.startsWith('http') ? 'noopener noreferrer' : undefined,
  };

  const subSectionHeaderStyling = item.isSection && level > 0 && !isFolderLink && "text-xs opacity-90 font-normal";

  const buttonContent = (
    <SidebarMenuButton
      onClick={handleToggleOrNavigate}
      tooltip={isCollapsed ? item.title : undefined}
      aria-expanded={isOpen}
      isActive={itemIsActive && !subSectionHeaderStyling} 
      className={cn(subSectionHeaderStyling)}
      level={level}
    >
      {itemTitleContent}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem 
      as={motion.li} 
      variants={menuItemVariants} 
      initial="initial"
      animate="animate"
      whileHover={!isCollapsed ? "hover" : undefined}
      whileTap="tap"
    >
      {isFolderLink && !(item.href && item.href.startsWith('#')) ? (
        <Link {...commonLinkProps} passHref legacyBehavior>
          {buttonContent}
        </Link>
      ) : (
        hasSubItems ? buttonContent : (
          <Link {...commonLinkProps} passHref legacyBehavior>
            {buttonContent}
          </Link>
        )
      )}
      {(!isCollapsed || useSidebar().isMobile) && hasSubItems && (
        <AnimatePresence>
          {isOpen && (
            <SidebarMenuSub 
              as={motion.ul} 
              variants={subMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden"
            >
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={`${subItem.href || subItem.title}-${index}-${level + 1}-${item.isSection}`}
                  item={subItem}
                  level={level + 1}
                  isCollapsed={isCollapsed}
                  currentPath={currentPath}
                  onLinkClick={onLinkClick}
                  initialOpen={isActiveAncestor} 
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
  const { state: sidebarState, isMobile, setOpenMobile, isResizing } = useSidebar();
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
          key={`${item.href || item.title}-${index}-level0-${item.isSection}`}
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
  
  const normalizePath = (p: string) => {
    let normalized = p.replace(/\/(index|_index)$/, '');
    if (normalized !== '/docs' && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized || '/docs';
  };

  const sidebarStructure = (
    <>
      <SidebarHeader className={cn(isCollapsed && "justify-center", isResizing && "!cursor-ew-resize")}>
        <Logo collapsed={isCollapsed} className={cn(isCollapsed ? "" : "ml-1", "transition-all duration-300")} />
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
        {isLoading ? ( 
          <div className="p-2 space-y-0.5">
            {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showText={!isCollapsed || isMobile} />)}
          </div>
        ) : (
          sidebarMenuContent
        )}
      </SidebarContent>
      {!isMobile && useSidebar().collapsible === 'resizable' && (
        <div 
          onMouseDown={useSidebar().handleMouseDownOnResizeHandle}
          className={cn(
            "absolute top-0 right-[-2px] h-full w-1.5 cursor-ew-resize group-hover/sidebar-wrapper:bg-sidebar-ring/30 active:bg-sidebar-ring/50 z-10 transition-colors duration-150 ease-in-out",
            isResizing && "bg-sidebar-ring/50",
            isCollapsed && "hidden" // Hide resize handle when fully collapsed by resizer
          )}
          title="Resize sidebar"
          aria-label="Resize sidebar"
        >
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover/sidebar-wrapper:opacity-70 group-data-[state=resizing]/sidebar-wrapper:opacity-70 transition-opacity"/>
        </div>
      )}
    </>
  );

  if (isMobile === undefined) { // Still determining mobile state, render a placeholder for desktop
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        "w-[var(--sidebar-width-icon)]" 
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
  
  return (
    <DesktopSidebar variant="sidebar" collapsible={useSidebar().collapsible}>
      {isMobile && <SheetTitle className="sr-only">Main Menu</SheetTitle>}
      {sidebarStructure}
    </DesktopSidebar>
  );
}
    

