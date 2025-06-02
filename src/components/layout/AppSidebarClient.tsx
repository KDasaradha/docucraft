// src/components/layout/AppSidebarClient.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as DesktopSidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
  SidebarMenuSkeleton,
  SheetClose, // From ui/sidebar which re-exports Radix's SheetClose
} from '@/components/ui/sidebar';
import { SheetContent as MobileSheetContent, SheetTitle } from "@/components/ui/sheet"; // Actual SheetContent and SheetTitle for mobile
import { Button } from '@/components/ui/button';
import type { NavItem } from '@/lib/docs'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ExternalLink, ChevronDown, X } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchDialog } from '@/components/search/SearchDialog';


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

// Optimize menu item animations
const menuItemVariants = {
  initial: { opacity: 0, x: -5 }, // Reduced x offset from -10 to -5
  animate: { opacity: 1, x: 0, transition: { duration: 0.2 } }, // Reduced duration from 0.3 to 0.2
  exit: { opacity: 0, x: -5, transition: { duration: 0.15 } }, // Reduced duration and offset
};

// Optimize submenu animations
const subMenuVariants = {
  open: { 
    height: 'auto', 
    opacity: 1, 
    transition: { duration: 0.2, ease: "easeOut" } // Reduced duration and changed ease
  },
  closed: { 
    height: 0, 
    opacity: 0, 
    transition: { duration: 0.2, ease: "easeIn" } // Reduced duration and changed ease
  }
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


// First, let's split the component into smaller parts to reduce complexity

interface ItemTitleContentProps {
  item: NavItem;
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
}

const ItemTitleContent: React.FC<ItemTitleContentProps> = ({ item, isCollapsed, isMobile, isOpen }) => (
  <>
    {/* Remove the icon check since it's not in NavItem interface */}
    <span className={cn(
      "truncate flex-grow",
      item.isSection && "font-semibold text-sm",
      isCollapsed && !isMobile && "sr-only"
    )}>{item.title}</span>
    {item.isExternal && (!isCollapsed || isMobile) && (
      <ExternalLink className="ml-1 h-3.5 w-3.5 text-muted-foreground shrink-0" />
    )}
    {item.items && item.items.length > 0 && (!isCollapsed || isMobile) && (
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

interface SectionHeaderProps {
  item: NavItem;
  isCollapsed: boolean;
  isMobile: boolean;
  level: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ item, isCollapsed, isMobile, level }) => (
  <motion.div 
    variants={menuItemVariants}
    className={cn(
      "px-3 pt-5 pb-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
      level > 0 && "pt-3 text-sidebar-foreground/60",
      isCollapsed && !isMobile && "text-center px-1 text-[0.6rem] py-2"
    )}
  >
    {isCollapsed && !isMobile ? item.title.substring(0,1).toUpperCase() : item.title}
  </motion.div>
);

// Refactor RecursiveNavItem for lower cognitive complexity and robust type usage (lines 127-141)
const RecursiveNavItem: React.FC<RecursiveNavItemProps> = ({
  item,
  level,
  isCollapsed,
  currentPath,
  onLinkClick,
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const { isMobile } = useSidebar();

  const normalizedItemHref = normalizePath(item.href);
  const normalizedCurrentPath = normalizePath(currentPath);
  const isDirectlyActive = normalizedItemHref === normalizedCurrentPath && normalizedItemHref !== "#";
  const hasSubItems = (item.items?.length ?? 0) > 0;

  useEffect(() => {
    if (hasSubItems && normalizedCurrentPath.startsWith(normalizedItemHref + "/")) {
      setIsOpen(true);
    }
  }, [hasSubItems, normalizedCurrentPath, normalizedItemHref]);

  const isActiveAncestor =
    normalizedItemHref !== '#' &&
    normalizedCurrentPath.startsWith(normalizedItemHref + '/') && 
    hasSubItems;
  
  useEffect(() => {
    if (isActiveAncestor && !isOpen) setIsOpen(true);
  }, [isActiveAncestor, isOpen]);

  const isFolderLink = item.href && !item.href.startsWith('http') && !item.href.startsWith('#') && !item.isExternal;
  const isPureSectionHeader = item.isSection && level === 0 && !hasSubItems && (!item.href || item.href === '#');
  const isSubSectionHeader = item.isSection && level > 0 && !isFolderLink && !hasSubItems;

  if (isPureSectionHeader || isSubSectionHeader) {
    return <SectionHeader item={item} isCollapsed={isCollapsed} isMobile={isMobile} level={level} />;
  }
  
  const handleToggleOrNavigate = (e: React.MouseEvent) => {
    if (hasSubItems && (!item.href || item.href === '#' || (item.isSection && !isFolderLink))) {
      setIsOpen(!isOpen);
      if (item.isSection && !isFolderLink && item.href === '#') {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (item.href && item.href !== '#') onLinkClick();
  };

  const buttonContent = (
    <SidebarMenuButton
      onClick={handleToggleOrNavigate}
      tooltip={isCollapsed && !isMobile ? item.title : undefined}
      aria-expanded={isOpen}
      isActive={isDirectlyActive || isActiveAncestor}
      level={level}
      className={cn(isCollapsed && !isMobile && "justify-center")}
      hasSubItems={hasSubItems}
      isOpen={isOpen}
    >
      <ItemTitleContent 
        item={item} 
        isCollapsed={isCollapsed} 
        isMobile={isMobile} 
        isOpen={isOpen} 
      />
    </SidebarMenuButton>
  );

  return (
    <motion.li variants={menuItemVariants} className="list-none">
      {item.href && item.href !== '#' ? (
        <Link 
          href={item.href} 
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          passHref 
          legacyBehavior
        >
          {React.cloneElement(buttonContent, { 'aria-current': isDirectlyActive ? 'page' : undefined })}
        </Link>
      ) : (
        React.cloneElement(buttonContent, { 
          'aria-current': isDirectlyActive ? 'page' : undefined,
          role: hasSubItems ? 'button' : 'heading',
          'aria-level': level + 2
        })
      )}
      {(!isCollapsed || isMobile) && hasSubItems && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.ul
              variants={subMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="submenu-list"
            >
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
            </motion.ul>
          )}
        </AnimatePresence>
      )}
    </motion.li>
  );
};


export default function AppSidebarClient({ navigationItems }: Readonly<AppSidebarClientProps>) {
  const { isMobile, setOpenMobile, isResizing, state: sidebarStateHook, collapsible: collapsibleTypeHook, defaultOpen: contextDefaultOpen, initialCollapsible: contextInitialCollapsible } = useSidebar();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Remove declaration for 'openMobile' if present
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
          initialOpen={!!(item.href && pathname.startsWith(normalizePath(item.href)))}
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
      <SidebarHeader className={cn(isMobile && "justify-between", "p-3 border-b border-sidebar-border flex items-center gap-2")}>  
        <SearchDialog /> {/* Removed max-width to allow search to take full width */}
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

