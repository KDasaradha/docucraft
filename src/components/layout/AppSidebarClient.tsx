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
import { ExternalLink, ChevronDown, X, ChevronRight, Home } from 'lucide-react'; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedSearchDialog } from '@/components/enhanced/EnhancedSearchDialog';


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

// Enhanced menu item animations
const menuItemVariants = {
  initial: { opacity: 0, x: -12, scale: 0.95 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      duration: 0.4, 
      ease: "easeOut",
      type: "spring",
      stiffness: 260,
      damping: 20
    } 
  },
  exit: { 
    opacity: 0, 
    x: -12, 
    scale: 0.95,
    transition: { duration: 0.25, ease: "easeIn" } 
  },
  hover: {
    x: 3,
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Enhanced submenu animations
const subMenuVariants = {
  open: { 
    height: 'auto', 
    opacity: 1,
    transition: { 
      duration: 0.4, 
      ease: "easeOut",
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  },
  closed: { 
    height: 0, 
    opacity: 0, 
    transition: { 
      duration: 0.3, 
      ease: "easeIn",
      staggerChildren: 0.03,
      staggerDirection: -1
    }
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
    {/* Add visual indicator for different item types */}
    {!isCollapsed && !isMobile && item.isSection && (
      <div className="w-2 h-2 rounded-full bg-sidebar-primary/60 shrink-0 mr-2" />
    )}
    <span className={cn(
      "truncate flex-grow",
      item.isSection && "font-semibold text-sm",
      isCollapsed && !isMobile && "sr-only"
    )}>{item.title}</span>
    {item.isExternal && (!isCollapsed || isMobile) && (
      <ExternalLink className="ml-1 h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
    )}
    {item.items && item.items.length > 0 && (!isCollapsed || isMobile) && (
      <motion.div 
        animate={{ rotate: isOpen ? 0 : -90 }} 
        transition={{ duration: 0.3, ease: "easeInOut" }} 
        className={cn("ml-auto", isCollapsed && !isMobile && "hidden")}
      >
        <ChevronDown className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
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

interface BreadcrumbProps {
  navigationItems: NavItem[];
  currentPath: string;
  isCollapsed: boolean;
  isMobile: boolean;
}

const findPathToItem = (items: NavItem[], targetPath: string, currentPath: NavItem[] = []): NavItem[] | null => {
  for (const item of items) {
    const normalizedItemHref = normalizePath(item.href);
    const normalizedTargetPath = normalizePath(targetPath);
    
    if (normalizedItemHref === normalizedTargetPath && normalizedItemHref !== "#") {
      return [...currentPath, item];
    }
    
    if (item.items && item.items.length > 0) {
      const result = findPathToItem(item.items, targetPath, [...currentPath, item]);
      if (result) return result;
    }
  }
  return null;
};

const SidebarBreadcrumb: React.FC<BreadcrumbProps> = ({ navigationItems, currentPath, isCollapsed, isMobile }) => {
  const pathItems = findPathToItem(navigationItems, currentPath);
  
  if (!pathItems || pathItems.length === 0 || isCollapsed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-3 py-2 border-b border-sidebar-border/30 bg-sidebar-accent/20"
    >
      <div className="flex items-center gap-1 text-xs text-sidebar-foreground/70">
        <Home className="h-3 w-3" />
        {pathItems.map((item, index) => (
          <React.Fragment key={item.href || item.title}>
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span 
              className={cn(
                "truncate",
                index === pathItems.length - 1 && "text-sidebar-accent-foreground font-medium"
              )}
              title={item.title}
            >
              {item.title}
            </span>
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
};

const SectionHeader: React.FC<SectionHeaderProps> = ({ item, isCollapsed, isMobile, level }) => (
  <motion.div 
    variants={menuItemVariants}
    className={cn(
      "px-3 pt-5 pb-2 text-xs font-semibold text-sidebar-foreground/70 tracking-wider uppercase select-none truncate",
      "border-b border-sidebar-border/20 mb-2",
      level > 0 && "pt-3 text-sidebar-foreground/60 border-b-0 mb-1",
      isCollapsed && !isMobile && "text-center px-1 text-[0.6rem] py-2 border-b-0"
    )}
  >
    {isCollapsed && !isMobile ? (
      <div className="w-6 h-6 rounded-full bg-sidebar-accent/50 flex items-center justify-center text-[0.6rem] font-bold">
        {item.title.substring(0,1).toUpperCase()}
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span>{item.title}</span>
        {level === 0 && (
          <div className="flex-1 h-px bg-gradient-to-r from-sidebar-border/30 to-transparent" />
        )}
      </div>
    )}
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

  // Check if this item is in the active path (breadcrumb-style highlighting)
  const isInActivePath = 
    normalizedItemHref !== '#' &&
    (normalizedCurrentPath.startsWith(normalizedItemHref + '/') || isDirectlyActive);
  
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
      isActive={isDirectlyActive}
      level={level}
      className={cn(
        isCollapsed && !isMobile && "justify-center",
        // Enhanced active state styling
        isDirectlyActive && "ring-2 ring-sidebar-ring/20 shadow-sm",
        // Breadcrumb-style highlighting for ancestor items
        isInActivePath && !isDirectlyActive && "bg-sidebar-accent/30 text-sidebar-accent-foreground/80",
        // Improved hover states
        "transition-all duration-200 ease-in-out",
        "hover:shadow-sm hover:scale-[1.02]",
        // Better focus states
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2"
      )}
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
    <motion.li 
      variants={menuItemVariants} 
      className={cn(
        "list-none relative",
        // Add visual indicator for active path
        isDirectlyActive && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-sidebar-primary before:rounded-r-full",
        isInActivePath && !isDirectlyActive && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-sidebar-accent-foreground/40 before:rounded-r-full"
      )}
      whileHover="hover"
    >
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
              className={cn(
                "submenu-list relative",
                // Enhanced submenu styling
                "ml-2 border-l-2 border-sidebar-border/30 pl-3 space-y-1",
                // Add subtle background for active submenu
                isInActivePath && "border-l-sidebar-accent-foreground/20"
              )}
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

  // Add smooth scroll to active item when page loads
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        const activeElement = document.querySelector('[aria-current="page"]');
        if (activeElement) {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, isLoading]);

  // Remove declaration for 'openMobile' if present
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isCollapsed = !isMobile && sidebarStateHook === "collapsed";
  
  const sidebarMenuContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
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
    </motion.div>
  );
  
  const sidebarSkeleton = (
    <div className={cn("p-2 space-y-0.5", isCollapsed && "px-1.5")}>
      {[...Array(8)].map((_, i) => <SidebarMenuSkeleton key={i} showText={!isCollapsed} />)}
    </div>
  );

  const sidebarStructure = (
    <>
      <SidebarHeader className={cn(isMobile && "justify-between", "p-3 border-b border-sidebar-border flex items-center gap-2")}>  
        <EnhancedSearchDialog />
        {isMobile && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        )}
      </SidebarHeader>
      <SidebarBreadcrumb 
        navigationItems={navigationItems}
        currentPath={pathname}
        isCollapsed={isCollapsed}
        isMobile={isMobile}
      />
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

