// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, GripVertical, ChevronDown, ChevronRight } from "lucide-react"; 
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import * as DialogPrimitive from "@radix-ui/react-dialog" // Used by Sheet
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet as RadixSheet, SheetContent as RadixSheetContent, SheetTrigger as RadixSheetTriggerOriginal, SheetClose as RadixSheetCloseOriginal, SheetTitle as RadixSheetTitleOriginal } from "@/components/ui/sheet";


// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "resizable";


const DEFAULT_EXPANDED_WIDTH_REM = 16; 
const SIDEBAR_WIDTH_ICON_REM = 3.5; 
const MIN_RESIZE_WIDTH_REM = 12;
const MAX_RESIZE_WIDTH_REM = 24;
const LOCAL_STORAGE_SIDEBAR_WIDTH_KEY = "sidebarWidthPx";
const RESIZE_COLLAPSE_THRESHOLD_PX = 30; 

const getRemInPx = () => {
  if (typeof window === 'undefined') return 16; 
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
};


interface SidebarContextProps {
  collapsible: CollapsibleType
  state: SidebarState
  isMobile: boolean | undefined 
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  sidebarWidthPx: number 
  setSidebarWidthPx: (width: number) => void
  isResizing: boolean
  handleMouseDownOnResizeHandle: (e: React.MouseEvent<HTMLDivElement>) => void;
  defaultOpen?: boolean; 
  initialCollapsible?: CollapsibleType; 
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  collapsible?: CollapsibleType
  initialSidebarWidth?: string 
}


export function SidebarProvider({
  children,
  defaultOpen = true,
  collapsible: initialCollapsible = "resizable", 
  initialSidebarWidth = `${DEFAULT_EXPANDED_WIDTH_REM}rem`,
}: SidebarProviderProps) {
  const isMobileView = useIsMobile() 
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)
  const [isResizing, setIsResizing] = useState(false);
  
  const [remInPx, setRemInPx] = useState(16); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setRemInPx(getRemInPx());
        const handleResize = () => setRemInPx(getRemInPx());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const defaultWidthPx = useMemo(() => parseFloat(initialSidebarWidth) * remInPx, [initialSidebarWidth, remInPx]);
  const minWidthPx = useMemo(() => MIN_RESIZE_WIDTH_REM * remInPx, [remInPx]);
  const maxWidthPx = useMemo(() => MAX_RESIZE_WIDTH_REM * remInPx, [remInPx]);
  const iconWidthPx = useMemo(() => SIDEBAR_WIDTH_ICON_REM * remInPx, [remInPx]);


  const [sidebarWidthPx, setSidebarWidthState] = useState(() => {
    return defaultWidthPx;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedWidth = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_WIDTH_KEY);
      if (storedWidth) {
        setSidebarWidthState(Math.max(minWidthPx, Math.min(parseInt(storedWidth, 10), maxWidthPx)));
      } else {
        setSidebarWidthState(defaultWidthPx);
      }
    }
  }, [minWidthPx, maxWidthPx, defaultWidthPx]);


  const setSidebarWidthPx = useCallback((newWidth: number) => {
    const clampedWidth = Math.max(minWidthPx, Math.min(newWidth, maxWidthPx));
    setSidebarWidthState(clampedWidth);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_SIDEBAR_WIDTH_KEY, clampedWidth.toString());
    }
  }, [minWidthPx, maxWidthPx]);

  const effectiveCollapsible = isMobileView === undefined ? initialCollapsible : (isMobileView ? "offcanvas" : initialCollapsible);


  const state = useMemo<SidebarState>(() => {
    if (isMobileView === undefined) { 
      return defaultOpen ? "expanded" : "collapsed";
    }
    if (isMobileView) return "offcanvas"
    if (effectiveCollapsible === 'resizable' && sidebarWidthPx <= iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) return "collapsed";
    
    return isCollapsedInternal ? "collapsed" : "expanded"
  }, [isMobileView, isCollapsedInternal, effectiveCollapsible, sidebarWidthPx, iconWidthPx, defaultOpen])


  const toggleSidebar = useCallback(() => {
    if (isMobileView) {
      setOpenMobile((prev) => !prev)
    } else if (effectiveCollapsible === 'resizable') {
      if (sidebarWidthPx > iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) {
        setSidebarWidthPx(iconWidthPx);
      } else {
        setSidebarWidthPx(defaultWidthPx);
      }
    } else { 
      setIsCollapsedInternal((prev) => !prev)
    }
  }, [isMobileView, effectiveCollapsible, sidebarWidthPx, iconWidthPx, setSidebarWidthPx, defaultWidthPx])

  useEffect(() => {
    if (isMobileView === false) { 
      setOpenMobile(false)
    }
  }, [isMobileView])
  
  const handleMouseDownOnResizeHandle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileView || effectiveCollapsible !== 'resizable' || state === 'collapsed') return;
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [isMobileView, effectiveCollapsible, state]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setSidebarWidthPx(e.clientX);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (typeof document !== 'undefined' && document.body.style.cursor === 'ew-resize') {
        document.body.style.cursor = 'default';
      }
      if (typeof document !== 'undefined' && document.body.style.userSelect === 'none') {
         document.body.style.userSelect = 'auto';
      }
    };
  }, [isResizing, setSidebarWidthPx]);


  useEffect(() => {
    if (typeof window !== "undefined" && isMobileView !== undefined) { 
      const root = document.documentElement;
      const currentSidebarWidth = isMobileView
        ? (openMobile ? defaultWidthPx : 0)
        : (state === 'expanded' ? sidebarWidthPx : iconWidthPx);
      
      root.style.setProperty('--current-sidebar-width', `${currentSidebarWidth}px`);
      root.style.setProperty('--sidebar-width-icon', `${iconWidthPx}px`);
      root.style.setProperty('--sidebar-width', `${defaultWidthPx}px`);
    }
  }, [sidebarWidthPx, state, isMobileView, openMobile, iconWidthPx, defaultWidthPx]);
  
  const contextValue: SidebarContextProps = {
    collapsible: effectiveCollapsible,
    state,
    isMobile: isMobileView,
    openMobile,
    setOpenMobile,
    toggleSidebar,
    sidebarWidthPx,
    setSidebarWidthPx,
    isResizing,
    handleMouseDownOnResizeHandle,
    defaultOpen,
    initialCollapsible,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        {/* The DialogPrimitive.Root is now managed by AppSidebarClient for mobile */}
        <div className="group/sidebar-wrapper flex h-full w-full" data-state={state}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// --- Sidebar Components ---

const sidebarVariants = cva(
  "hidden md:flex flex-col transition-all duration-200 ease-in-out group", // Hidden by default on mobile
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md",
      },
      isResizing: {
        true: "!transition-none cursor-ew-resize", 
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      isResizing: false,
    },
  }
)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  collapsibleType?: CollapsibleType // Changed from 'collapsible' to avoid conflict with HTML attribute
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsibleType, children, ...props }, ref) => {
  const { 
    state, 
    isResizing: contextIsResizing, 
    sidebarWidthPx, 
    iconWidthPx, 
    handleMouseDownOnResizeHandle,
    collapsible: contextCollapsible
  } = useSidebar()
  
  const effectiveCollapsibleType = collapsibleType || contextCollapsible;

  return (
    <aside
      ref={ref}
      className={cn(
        sidebarVariants({ variant, isResizing: contextIsResizing }),
        className
      )}
      style={{ width: state === 'collapsed' ? `${iconWidthPx}px` : `${sidebarWidthPx}px` }}
      data-state={state}
      {...props}
    >
      {children}
      {effectiveCollapsibleType === 'resizable' && state === 'expanded' && (
        <div
          onMouseDown={handleMouseDownOnResizeHandle}
          className={cn(
            "absolute top-0 right-[-3px] h-full w-1.5 cursor-ew-resize group-hover/sidebar-wrapper:bg-primary/10 active:bg-primary/20 z-10",
            "transition-colors duration-150 ease-in-out",
             contextIsResizing && "bg-primary/20"
          )}
          title="Resize sidebar"
        >
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover/sidebar-wrapper:opacity-70 group-data-[state=resizing]/sidebar-wrapper:opacity-70 transition-opacity"/>
        </div>
      )}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, ...props }, ref) => {
    const { toggleSidebar, isMobile } = useSidebar();
    
    if (typeof isMobile !== 'boolean' || !isMobile ) {
         return null; 
    }

    return (
      <RadixSheetTriggerOriginal asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={cn("md:hidden", className)} // Ensures it's hidden on desktop
          {...props}
        >
          <Menu />
        </Button>
      </RadixSheetTriggerOriginal>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isResizing, state, isMobile } = useSidebar();

    return (
        <div
          ref={ref}
          className={cn(
            "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
            !isMobile && state === 'collapsed' ? "justify-center" : "justify-between", 
            isResizing && "!cursor-ew-resize",
            className
          )}
          {...props}
        >
           {children}
        </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader"


const SidebarContent = forwardRef<
  React.ElementRef<typeof ScrollArea>, // Changed to ScrollArea ref
  React.ComponentPropsWithoutRef<typeof ScrollArea> // Changed to ScrollArea props
>(({ className, children, ...props }, ref) => {
  const { isResizing } = useSidebar();
  return (
    <ScrollArea ref={ref} className={cn("flex-1", isResizing && "!cursor-ew-resize", className)} {...props}>
        {children}
    </ScrollArea>
  );
});
SidebarContent.displayName = "SidebarContent";


const SidebarFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-3 border-t border-sidebar-border sticky bottom-0 bg-sidebar", className)}
      {...props}
    />
  )
)
SidebarFooter.displayName = "SidebarFooter"

const menuItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

const SidebarMenu = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => { // Added children
    const { state, isMobile } = useSidebar();
    const isTrulyCollapsed = state === 'collapsed' && !isMobile;
    return (
      <ul
        ref={ref}
        className={cn("space-y-0.5 py-2",
          isTrulyCollapsed ? "px-1.5" : "px-2", 
        className
        )}
        {...props}
      >
        {children}
      </ul>
    );
  }
)
SidebarMenu.displayName = "SidebarMenu"

interface SidebarMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> { // Changed to LiHTMLAttributes
  asChild?: boolean;
}

const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, asChild = false, children, ...props }, ref) => { 
    const Comp = asChild ? Slot : motion.li;
    return (
      <Comp
        ref={ref}
        className={cn("list-none", className)}
        variants={menuItemVariants} // Apply variants here for entry/exit if this is a motion component
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem";


interface SidebarMenuButtonProps extends ButtonProps {
  icon?: LucideIcon
  label?: string
  isActive?: boolean
  tooltip?: React.ReactNode 
  level?: number
  hasSubItems?: boolean 
  isOpen?: boolean 
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    { className, icon: Icon, label, isActive, asChild, tooltip, level = 0, children, hasSubItems, isOpen, ...props },
    ref
  ) => {
    const { state: sidebarState, isMobile, collapsible } = useSidebar()
    const isCollapsed = !isMobile && sidebarState === "collapsed" && collapsible !== "offcanvas";

    const content = (
      <>
        {Icon && <Icon className={cn("shrink-0", isCollapsed ? "size-5" : "size-4")} />}
        <span
          className={cn(
            "truncate flex-grow text-left",
            isCollapsed && "hidden",
          )}
        >
          {children || label}
        </span>
         {hasSubItems && (!isCollapsed || isMobile ) && ( 
           isOpen ? <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        )}
      </>
    )

    const buttonElement = (
      <Button
        ref={ref}
        variant={isActive ? "sidebarAccent" : "ghostSidebar"}
        className={cn(
          "h-auto min-h-[2.25rem] w-full justify-start items-center gap-2.5 text-sm px-2.5 py-1.5", 
          isCollapsed ? "justify-center px-0 h-9" : `pl-${2 + Math.min(level * 1.5, 6)}`, 
          className
        )}
        asChild={asChild}
        {...props}
      >
        {asChild && React.isValidElement(children) ? children : content} 
      </Button>
    );


    if (isCollapsed && tooltip) {
      const TriggerComp = asChild && React.isValidElement(children) ? Slot : Button;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
             {asChild && React.isValidElement(children) ? (
                React.cloneElement(children as React.ReactElement<any>, {
                  className: cn(
                    (children as React.ReactElement<any>).props.className,
                    "h-9 w-full justify-center",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    className
                  ),
                })
             ) : (
                <Button
                  ref={ref} 
                  variant={isActive ? "sidebarAccent" : "ghostSidebar"}
                  className={cn("h-9 w-full justify-center", className)} 
                  {...props} 
                >
                  {Icon && <Icon className="size-5 shrink-0" />}
                  <span className="sr-only">{tooltip}</span>
                </Button>
             )}
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={10}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }
    return buttonElement
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const subMenuVariants = {
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }
};

const SidebarMenuSub = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => { // Added children
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

    if (isCollapsed) return null; 

    return (
      <motion.ul // Changed to motion.ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1", 
           "[&_ul]:pl-[calc(var(--sidebar-indent-base)_/_2)]", 
           "group-data-[state=collapsed]/sidebar-wrapper:hidden",
          className
        )}
        style={{ ['--sidebar-indent-base' as string]: '1rem' }} 
        variants={subMenuVariants}
        initial="closed"
        animate="open" // This will be controlled by AnimatePresence based on parent's isOpen
        exit="closed"
        {...props}
      >
        {children} {/* Render children */}
      </motion.ul>
    );
  }
);
SidebarMenuSub.displayName = "SidebarMenuSub";


const SidebarMenuSkeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean, showText?: boolean }>(
  ({ className, showIcon = true, showText = true, ...props }, ref) => {
    const { state: sidebarState, isMobile, collapsible } = useSidebar(); // Renamed state to avoid conflict
    const isCollapsed = !isMobile && sidebarState === "collapsed" && collapsible !== "offcanvas";
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); 

    useEffect(() => {
      // This will only run on the client, after initial hydration
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []);


    return (
      <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn(
          "h-9 w-full rounded-md flex items-center gap-2.5 px-2.5", 
          isCollapsed && "justify-center",
          className
        )}
        {...props}
      >
        {showIcon && !isCollapsed && ( 
           <Skeleton
            className="size-4 rounded-md bg-sidebar-foreground/10"
            data-sidebar="menu-skeleton-icon"
          />
        )}
         {showIcon && isCollapsed && ( 
           <Skeleton
            className="size-5 rounded-md bg-sidebar-foreground/10" 
            data-sidebar="menu-skeleton-icon"
          />
        )}
        {showText && !isCollapsed && ( 
          <Skeleton
            className="h-4 flex-1 max-w-[var(--skeleton-width,75%)] rounded-sm bg-sidebar-foreground/10"
            data-sidebar="menu-skeleton-text"
            style={{['--skeleton-width' as string]: skeletonTextWidth }} 
          />
        )}
      </div>
    )
  }
)
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"


export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSkeleton,
  // Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetDescription, SheetPortal, SheetOverlay are already exported above if needed globally
  RadixSheetCloseOriginal as SheetClose, // Re-exporting SheetClose from the Radix sheet components
  RadixSheetTitleOriginal as SheetTitle, // Re-exporting SheetTitle
}

```
  </content>
  </change>
  <change>
    <file>src/components/layout/AppSidebarClient.tsx</file>
    <description>Update AppSidebarClient to correctly use Sheet for mobile view, handle desktop sidebar logic, and ensure RecursiveNavItem interactive elements work by removing redundant motion props from SidebarMenuItem. Ensure unique keys for list items.</description>
    <content><![CDATA[// src/components/layout/AppSidebarClient.tsx
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
  </content>
  </change>
  <change>
    <file>src/app/(docs)/layout.tsx</file>
    <description>Remove unused imports (useEffect, useRef) from DocsLayout. Update AppSidebarClient usage for mobile sidebar functionality.</description>
    <content><![CDATA[// src/app/(docs)/layout.tsx
import type { ReactNode } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebarClient from '@/components/layout/AppSidebarClient';
import AppFooter from '@/components/layout/AppFooter';
import { getNavigation, type NavItem } from '@/lib/docs';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area'; // Keep if main content needs it separately

export default async function DocsLayout({ children }: { children: ReactNode }) {
  const navigationItems: NavItem[] = await getNavigation();

  return (
    <SidebarProvider 
      defaultOpen={true} 
      collapsible="resizable" // Example: make it resizable
      initialSidebarWidth="16rem" // Example initial width
    >
      <div className="flex flex-col min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-1 overflow-hidden pt-[var(--header-height)]">
          <AppSidebarClient navigationItems={navigationItems} />
          
          {/* Main Content Area */}
          <ScrollArea 
            className="flex-1 transition-all duration-300 ease-in-out md:ml-[var(--current-sidebar-width)]"
            id="main-content-scroll-area"
            // The style with --current-sidebar-width should be applied here
            // The actual CSS variable for margin is now managed by SidebarProvider via root style vars
          >
            <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:px-8 lg:py-12">
              {children}
            </main>
            <AppFooter />
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}
```
  </content>
  </change>
  <change>
    <file>src/components/ui/sheet.tsx</file>
    <description>Add an explicit close button to SheetContent for better mobile UX, as it's directly used now by AppSidebarClient.</description>
    <content><![CDATA[// src/components/ui/sheet.tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      onOpenAutoFocus={(e) => e.preventDefault()}
      {...props}
    >
      {children}
      {/* Re-added the close button for standalone SheetContent usage */}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```
  </content>
  </change>
  <change>
    <file>src/app/(docs)/docs-layout-client.tsx</file>
    <description>This file is no longer needed as its logic has been integrated into src/app/(docs)/layout.tsx and src/components/layout/AppSidebarClient.tsx for better separation of concerns and to manage sidebar responsiveness correctly.</description>
    <content><![CDATA[