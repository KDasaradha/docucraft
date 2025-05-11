// src/components/layout/AppSidebarClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
} from '@/components/ui/sidebar'; // Corrected import path
import { SheetContent as MobileSheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet"; // Actual SheetContent and SheetTitle for mobile
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import type { NavItem } from '@/lib/docs'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronDown, ChevronRight, X } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';


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

const normalizePath = (p: string | undefined): string => {
  if (!p) return '#';
  let normalized = p.replace(/\/(index|_index)(\.mdx?)?$/, '');
  if (normalized.endsWith('/') && normalized.length > 1 && normalized !== '/docs/') { 
    normalized = normalized.slice(0, -1);
  }
  if (normalized === '/docs/index' || normalized === '/docs/_index' || normalized === '/docs') {
    return '/docs';
  }
  return normalized || '/docs';
};


const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ item, level, isCollapsed, currentPath, onLinkClick, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { isMobile } = useSidebar();
  
  const normalizedItemHref = item.href ? normalizePath(item.href) : '#';
  const normalizedCurrentPath = normalizePath(currentPath);

  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath && normalizedItemHref !== '#';
  
  const isActiveAncestor = 
    normalizedItemHref !== '#' &&
    normalizedCurrentPath.startsWith(normalizedItemHref + '/') && 
    item.items && item.items.length > 0;
  
  const itemIsActive = isDirectlyActive || isActiveAncestor;

  useEffect(() => {
    if (isActiveAncestor && !isOpen) {
      setIsOpen(true);
    }
  }, [isActiveAncestor, isOpen, currentPath, item.href]); // Added dependencies


  const hasSubItems = item.items && item.items.length > 0;
  const isFolderLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#') && !item.isExternal;
  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!item.href || item.href === '#');
  const isSubSectionHeader = item.isSection && level > 0 && !isFolderLink && !hasSubItems;

  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems) {
      setIsOpen(!isOpen);
      // If it's a section header that also acts as a link, allow navigation
      if (isFolderLink || (item.isSection && item.href && item.href !== '#')) {
        // Navigation will happen via Link component, so just toggle state
      } else if (item.isSection && (!item.href || item.href === '#')) {
        // Prevent navigation for pure section headers that only toggle
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // Allow link click to proceed if it's a navigable link
    if (item.href && item.href !== '#') {
        onLinkClick();
    }
  };
  
  const itemTitleContent = (
    <>
      {item.icon && !isCollapsed && <item.icon className="mr-2 h-4 w-4 shrink-0 opacity-80" />}
      <span className={cn(
        "truncate flex-grow",
        item.isSection && level === 0 && "font-semibold text-sm",
        isCollapsed && !isMobile && "sr-only"
      )}>{item.title}</span>
      {item.isExternal && (!isCollapsed || isMobile) && (
        <ExternalLink className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
      )}
      {hasSubItems && (!isCollapsed || isMobile ) && (
        <motion.div 
          animate={{ rotate: isOpen ? 0 : -90 }} 
          transition={{ duration: 0.2 }} 
          className={cn("ml-auto", isCollapsed && !isMobile && "hidden")}
        >
           <ChevronDown className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        </motion.div>
      )}
    </>
  );

  const commonLinkProps = {
    target: item.isExternal ? '_blank' : undefined,
    rel: item.isExternal ? 'noopener noreferrer' : undefined,
  };

  const buttonContent = (
    <SidebarMenuButton
      onClick={handleToggleOrNavigate}
      tooltip={isCollapsed && !isMobile ? item.title : undefined}
      aria-expanded={hasSubItems ? isOpen : undefined}
      isActive={itemIsActive} 
      level={level}
      className={cn(isCollapsed && !isMobile && "justify-center", "group")} // Added group for chevron
      hasSubItems={hasSubItems}
      isOpen={isOpen}
    >
      {itemTitleContent}
    </SidebarMenuButton>
  );

  const isNavigable = item.href && item.href !== '#';

  if (isPureSectionHeader || isSubSectionHeader) {
    return (
      <motion.div 
        variants={menuItemVariants}
        className={cn(
          "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
          isSubSectionHeader && "pt-3 text-sidebar-foreground/60",
          isCollapsed && !isMobile && "text-center px-1 text-[0.6rem] py-2"
        )}
        onClick={hasSubItems ? handleToggleOrNavigate : undefined} // Allow toggle for section headers with children
        role={hasSubItems ? "button" : "heading"}
        aria-level={level + 2}
        tabIndex={hasSubItems ? 0 : undefined}
        onKeyDown={hasSubItems ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleOrNavigate(e as any); } : undefined}
      >
        {isCollapsed && !isMobile && item.title.substring(0,1).toUpperCase()}
        {(!isCollapsed || isMobile) && item.title}
        {/* Removed chevron from here as it's part of itemTitleContent in SidebarMenuButton */}
      </motion.div>
    );
  }


  return (
    <motion.li variants={menuItemVariants} className="list-none" layout="position">
      {isNavigable ? (
        <Link href={item.href!} {...commonLinkProps} passHref legacyBehavior>
            {React.cloneElement(buttonContent as React.ReactElement, { 'aria-current': isDirectlyActive ? 'page' : undefined })}
        </Link>
      ) : (
        React.cloneElement(buttonContent as React.ReactElement, { 'aria-current': isDirectlyActive ? 'page' : undefined, role: hasSubItems ? 'button' : 'heading', 'aria-level': level + 2 })
      )}
      {(!isCollapsed || isMobile) && hasSubItems && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <SidebarMenuSub as={motion.ul} variants={subMenuVariants} initial="closed" animate="open" exit="closed" layout>
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={`${subItem.href || subItem.title}-${index}-${level}`} 
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
    </motion.li>
  );
};


export default function AppSidebarClient({ navigationItems }: AppSidebarClientProps) {
  const { isMobile, openMobile, setOpenMobile, state: sidebarStateHook, collapsible: collapsibleTypeHook, defaultOpen: contextDefaultOpen, initialCollapsible: contextInitialCollapsible } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarStateHook === "collapsed";
  
  const sidebarMenuContent = (
    <SidebarMenu className={cn("p-2", isCollapsed && "px-1.5")}> 
      {navigationItems.map((item, index) => (
        <RecursiveNavItem
          key={`${item.href || item.title}-${item.order}-${index}`} 
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
      <SidebarHeader className={cn(isMobile && "justify-between", "p-3 border-b border-sidebar-border flex items-center")}>
         <div className="flex flex-col">
          <Logo collapsed={isCollapsed && !isMobile} className={cn(isCollapsed && !isMobile ? "" : "ml-1", "transition-all duration-300")} />
          {(!isCollapsed || isMobile) && (
            <p className="text-xs text-sidebar-foreground/70 mt-1 ml-1 truncate">
              Your Catchy Tagline Here
            </p>
          )}
        </div>
        {isMobile && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        )}
      </SidebarHeader>
      <SidebarContent className="flex-1">
          {isLoading ? sidebarSkeleton : sidebarMenuContent}
      </SidebarContent>
    </>
  );

  if (isLoading) { 
    const initialCollapsibleFromContext = contextInitialCollapsible;
    const defaultOpenFromContext = contextDefaultOpen;
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width-default)]" 
      )}>
         <SidebarHeader className={cn("p-3 border-b border-sidebar-border flex items-center", initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext && "justify-center")}>
          <Logo collapsed={initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext} />
           {(!(initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext)) && (
            <p className="text-xs text-sidebar-foreground/70 mt-1 ml-1 truncate">
              Your Catchy Tagline Here
            </p>
          )}
        </SidebarHeader>
        <ScrollArea className="flex-1">
          {sidebarSkeleton}
        </ScrollArea>
      </aside>
    );
  }
  
  if (isMobile) {
    return (
        <MobileSheetContent side="left" className={cn("p-0 flex flex-col w-[var(--sidebar-width-default)]")}>
         <SheetTitle className="sr-only">Main Menu</SheetTitle> 
          {sidebarStructure}
        </MobileSheetContent>
    );
  }

  return (
    <DesktopSidebar 
      className={cn("fixed top-[var(--header-height)] bottom-0 left-0 z-30")}
    >
      {sidebarStructure}
    </DesktopSidebar>
  );
}