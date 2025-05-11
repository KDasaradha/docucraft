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
  if (!p) return '#'; // Handle undefined href gracefully
  let normalized = p.replace(/\/(index|_index)(\.mdx?)?$/, '');
  if (normalized.endsWith('/') && normalized.length > 1 && normalized !== '/docs/') { 
    normalized = normalized.slice(0, -1);
  }
   // Ensure /docs/index or /docs/_index becomes /docs
  if (normalized === '/docs/index' || normalized === '/docs/_index') {
    return '/docs';
  }
  return normalized || '/docs'; // Default to /docs if path becomes empty (e.g. from /docs/ only)
};


const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({ item, level, isCollapsed, currentPath, onLinkClick, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { isMobile } = useSidebar();
  
  const normalizedItemHref = item.href ? normalizePath(item.href) : '#'; // Use '#' if href is undefined
  const normalizedCurrentPath = normalizePath(currentPath);

  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath && normalizedItemHref !== '#';
  
  // An item is an active ancestor if the current path starts with its href, 
  // AND the href is not just a section link (which would be '#')
  // AND the item actually has children.
  const isActiveAncestor = 
    normalizedItemHref !== '#' &&
    normalizedCurrentPath.startsWith(normalizedItemHref + '/') && 
    item.items && item.items.length > 0;
  
  const itemIsActive = isDirectlyActive || isActiveAncestor;

  useEffect(() => {
    // Automatically open sections if they are an ancestor of the current path
    if (isActiveAncestor && !isOpen) {
      setIsOpen(true);
    }
  }, [isActiveAncestor, isOpen]);


  const hasSubItems = item.items && item.items.length > 0;
  // A link is a folder link if it has an href, is not external, not an anchor, and not a section header meant only for grouping
  const isFolderLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#') && !item.isExternal;

  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!item.href || item.href === '#');
  const isSubSectionHeader = item.isSection && level > 0 && !isFolderLink && !hasSubItems;


  if (isPureSectionHeader || isSubSectionHeader) {
    return (
      <motion.div 
        variants={menuItemVariants}
        className={cn(
          "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
          isSubSectionHeader && "pt-3 text-sidebar-foreground/60",
          isCollapsed && !isMobile && "text-center px-1 text-[0.6rem] py-2" // Adjusted for better visibility of single letter
        )}
      >
        {isCollapsed && !isMobile && item.title.substring(0,1).toUpperCase()}
        {(!isCollapsed || isMobile) && item.title}
      </motion.div>
    );
  }
  
  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems && (!item.href || item.href === '#' || item.isSection && !isFolderLink) ) { // Toggle if it's a section header without a direct link or has sub-items
      setIsOpen(!isOpen);
       if (item.isSection && !isFolderLink && item.href === '#') { // Prevent navigation for pure section headers
         e.preventDefault();
         e.stopPropagation();
       }
    }
     // Allow navigation if it's a folder link or has no sub-items,
     // and it's not a pure section header that was just toggled.
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
      aria-expanded={isOpen}
      isActive={itemIsActive} 
      level={level}
      className={cn(isCollapsed && !isMobile && "justify-center")}
      hasSubItems={hasSubItems}
      isOpen={isOpen}
    >
      {itemTitleContent}
    </SidebarMenuButton>
  );

  // If item.href is '#' or undefined, it's a non-navigable header or a section toggle
  const isNavigable = item.href && item.href !== '#';

  return (
    <motion.li variants={menuItemVariants} className="list-none">
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
            <SidebarMenuSub as={motion.ul} variants={subMenuVariants} initial="closed" animate="open" exit="closed">
              {item.items?.map((subItem, index) => (
                <RecursiveNavItem
                  key={`${subItem.href || subItem.title}-${index}`} 
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
  const { isMobile, openMobile, setOpenMobile, isResizing, state: sidebarStateHook, collapsible: collapsibleTypeHook, defaultOpen: contextDefaultOpen, initialCollapsible: contextInitialCollapsible } = useSidebar();
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
    <SidebarMenu className={cn(isCollapsed && "px-1.5")}> 
      {navigationItems.map((item, index) => (
        <RecursiveNavItem
          key={`${item.href || item.title}-${item.order}-${index}`} 
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
      <SidebarHeader className={cn(isMobile && "justify-between", "p-3 border-b border-sidebar-border flex items-center")}>
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
        <ScrollArea className="h-full"> {/* Ensure ScrollArea takes full height of SidebarContent */}
          {isLoading ? sidebarSkeleton : sidebarMenuContent}
        </ScrollArea>
      </SidebarContent>
    </>
  );

  if (isLoading) { 
    // Use context values for initialCollapsible and defaultOpen
    const initialCollapsibleFromContext = contextInitialCollapsible;
    const defaultOpenFromContext = contextDefaultOpen;
    return (
      <aside className={cn(
        "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
        initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]" 
      )}>
         <SidebarHeader className={cn("p-3 border-b border-sidebar-border flex items-center", initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext && "justify-center")}>
          <Logo collapsed={initialCollapsibleFromContext === 'icon' && !defaultOpenFromContext} />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          {sidebarSkeleton}
        </ScrollArea>
      </aside>
    );
  }
  
  if (isMobile) {
    return (
        <MobileSheetContent side="left" className={cn("p-0 flex flex-col w-[var(--sidebar-width)]")}>
         <SheetTitle className="sr-only">Main Menu</SheetTitle> 
          {sidebarStructure}
        </MobileSheetContent>
    );
  }

  return (
    <DesktopSidebar 
      className={cn("fixed top-[var(--header-height)] bottom-0 left-0 z-30")}
      collapsibleType={collapsibleTypeHook} 
    >
      {sidebarStructure}
    </DesktopSidebar>
  );
}

