// src/components/ui/sidebar.tsx
"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, ChevronDown, ChevronRight, GripVertical } from "lucide-react" 
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet as RadixSheet, SheetTrigger as RadixSheetTrigger, SheetClose as RadixSheetClose, SheetContent as RadixSheetContent, SheetHeader as RadixSheetHeader, SheetTitle as RadixSheetTitle, SheetDescription as RadixSheetDescription, SheetFooter as RadixSheetFooter } from "@/components/ui/sheet";


// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "offcanvas"

const DEFAULT_EXPANDED_WIDTH_REM = 16; // 16rem
const MIN_SIDEBAR_WIDTH_PX = 192; // 12rem (12 * 16px)
const MAX_SIDEBAR_WIDTH_PX = 384; // 24rem (24 * 16px)

interface SidebarContextProps {
  collapsible: CollapsibleType
  state: SidebarState
  isMobile: boolean
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  sidebarWidth: number // width in pixels
  setSidebarWidth: (width: number) => void
  isResizing: boolean
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
  initialSidebarWidth?: string // e.g., "16rem"
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  collapsible: initialCollapsible = "icon",
  initialSidebarWidth = `${DEFAULT_EXPANDED_WIDTH_REM}rem`, 
}: SidebarProviderProps) {
  const isMobileView = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)
  const [isResizing, setIsResizing] = useState(false);

  const [sidebarWidth, setSidebarWidthState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedWidth = localStorage.getItem("sidebarWidth");
      if (storedWidth) return parseInt(storedWidth, 10);
    }
    // Convert initialSidebarWidth (e.g., "16rem") to pixels
    if (typeof window !== "undefined" && initialSidebarWidth.endsWith("rem")) {
      return parseFloat(initialSidebarWidth) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    return DEFAULT_EXPANDED_WIDTH_REM * 16; // Fallback to default in pixels
  });

  const setSidebarWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH_PX, Math.min(newWidth, MAX_SIDEBAR_WIDTH_PX));
    setSidebarWidthState(clampedWidth);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarWidth", clampedWidth.toString());
    }
  }, []);


  const collapsible = isMobileView ? "offcanvas" : initialCollapsible

  const state = useMemo<SidebarState>(() => {
    if (isMobileView) return "offcanvas"
    return isCollapsedInternal ? "collapsed" : "expanded"
  }, [isMobileView, isCollapsedInternal])

  const toggleSidebar = useCallback(() => {
    if (isMobileView) {
      setOpenMobile((prev) => !prev)
    } else {
      setIsCollapsedInternal((prev) => !prev)
    }
  }, [isMobileView])

  useEffect(() => {
    if (!isMobileView) {
      setOpenMobile(false) 
    }
  }, [isMobileView])


  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (state === 'expanded' && !isMobileView) {
        root.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
      } else if (state === 'collapsed' && !isMobileView) {
        root.style.setProperty('--sidebar-width', 'var(--sidebar-width-icon)');
      } else { // offcanvas or mobile
        root.style.setProperty('--sidebar-width', `${DEFAULT_EXPANDED_WIDTH_REM}rem`); // default for mobile sheet
      }
    }
  }, [sidebarWidth, state, isMobileView]);

  const currentAppliedWidth = useMemo(() => {
    if (isMobileView && openMobile) return `${DEFAULT_EXPANDED_WIDTH_REM * 16}px`; // Width of mobile sheet
    if (isMobileView && !openMobile) return "0px"; // No sidebar visible
    if (state === 'collapsed') return "var(--sidebar-width-icon)";
    return `${sidebarWidth}px`;
  }, [isMobileView, openMobile, state, sidebarWidth]);


  return (
    <SidebarContext.Provider
      value={{
        collapsible,
        state,
        isMobile: isMobileView,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        sidebarWidth,
        setSidebarWidth,
        isResizing
      }}
    >
      <TooltipProvider delayDuration={0}>
        <div 
          className="group/sidebar-wrapper flex h-full w-full" 
          data-state={state}
          style={{
            ['--current-sidebar-width' as string]: currentAppliedWidth
          }}
        >
           {!isMobileView && collapsible !== "offcanvas" && (
             <div
                className={cn(
                  "hidden md:block flex-shrink-0 transition-width duration-200 ease-in-out",
                   isResizing ? "!transition-none" : "", // Disable transition during resize
                  state === 'collapsed' ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
                )}
                aria-hidden="true"
             />
           )}
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}


const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = RadixSheetClose; 


const sidebarVariants = cva(
  "flex flex-col transition-width duration-200 ease-in-out group fixed top-[var(--header-height)] bottom-0 left-0 z-40",
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md",
      },
      isResizing: {
        true: "!transition-none cursor-col-resize",
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
  collapsible?: CollapsibleType 
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsible, children, ...props }, ref) => {
  const { isMobile, openMobile, setOpenMobile, state, collapsible: contextCollapsible, sidebarWidth, setSidebarWidth: setContextSidebarWidth, isResizing: contextIsResizing } = useSidebar()
  const effectiveCollapsible = collapsible || contextCollapsible;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [localIsResizing, setLocalIsResizing] = useState(false);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setLocalIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [setLocalIsResizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!localIsResizing || !sidebarRef.current) return;
      let newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
      // Ensure clientX is used relative to the viewport, not just any element.
      // If sidebar is fixed, clientX directly gives the width from the left edge of viewport.
      newWidth = e.clientX; 
      setContextSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (localIsResizing) {
        setLocalIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (localIsResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default'; // Reset cursor on cleanup
      document.body.style.userSelect = 'auto'; // Reset userSelect on cleanup
    };
  }, [localIsResizing, setContextSidebarWidth]);


  if (isMobile) {
    return (
      <RadixSheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
           {/* This div is a valid single child for Slot. The actual trigger button is in AppHeader. */}
          <div />
        </SheetTrigger>
        <RadixSheetContent side="left" className={cn("p-0 flex flex-col", className)} {...props}>
          {children}
        </RadixSheetContent>
      </RadixSheet>
    )
  }

  // Desktop view:
  return (
    <aside
      ref={sidebarRef} // Use the ref here
      className={cn(sidebarVariants({ variant, isResizing: localIsResizing || contextIsResizing }), 
        state === 'collapsed' ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]",
        className
      )}
      data-state={state} 
      {...props}
    >
      {children}
      {state === 'expanded' && effectiveCollapsible !== 'offcanvas' && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-primary/20 active:bg-primary/30",
            "transition-colors duration-150 ease-in-out",
            (localIsResizing || contextIsResizing) && "bg-primary/30"
          )}
          title="Resize sidebar"
        >
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"/>
        </div>
      )}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { toggleSidebar, isMobile } = useSidebar()
    if (typeof isMobile !== 'boolean' || !isMobile) {
         // Return a placeholder or null for SSR or when isMobile is not determined to avoid hydration mismatch
         return <Button ref={ref} variant="ghost" size="icon" className="opacity-0 pointer-events-none md:hidden" aria-hidden="true" {...props}><Menu /></Button>;
    }
    if (!isMobile) return null; // Don't render on desktop


    return (
      <RadixSheetTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="md:hidden" 
          {...props}
        >
          <Menu />
        </Button>
      </RadixSheetTrigger>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isMobile } = useSidebar();
    return (
      <SheetHeader // Use SheetHeader from Radix UI sheet for proper structure if it's a sheet
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
          "group-data-[state=collapsed]/sidebar:justify-center group-data-[state=expanded]/sidebar:justify-between",
          className
        )}
        {...props}
      >
        {isMobile && <RadixSheetTitle className="sr-only">Main Menu</RadixSheetTitle>}
        {children}
        {isMobile && (
          <RadixSheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </RadixSheetClose>
        )}
      </SheetHeader>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader"


const SidebarContent = forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, children, ...props }, ref) => {
  return (
    <ScrollArea ref={ref} className={cn("flex-1", className)} {...props}>
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


const SidebarMenu = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("space-y-0.5 py-2", 
        "group-data-[state=expanded]/sidebar:px-2", // Add padding only when expanded
        "group-data-[state=collapsed]/sidebar:px-1"  // Minimal padding when collapsed
      )}
      {...props}
    />
  )
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("", className)} 
      {...props}
    />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends ButtonProps {
  icon?: LucideIcon
  label?: string
  isActive?: boolean
  asChild?: boolean
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
         {hasSubItems && !isCollapsed && ( 
           isOpen ? <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        )}
      </>
    )

    const button = (
      <Button
        ref={ref}
        variant={isActive ? "sidebarAccent" : "ghostSidebar"}
        className={cn(
          "h-auto min-h-[2.25rem] w-full justify-start items-center gap-2.5 text-sm px-3 py-2",
          isCollapsed && "justify-center px-0",
          `pl-${isCollapsed ? 3 : (3 + (level * 1.5))}`, // Dynamic padding based on level
          className
        )}
        asChild={asChild}
        {...props}
      >
        {asChild ? children : content}
      </Button>
    )


    if (isCollapsed && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={10}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }
    return button
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"


const SidebarMenuSub = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

    if (isCollapsed && !isMobile) return null; 

    return (
      <ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 group-data-[state=collapsed]/sidebar:hidden pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1",
           "[&_ul]:pl-[calc(var(--sidebar-indent-base)_/_2)]", // Nested sub-menus also get indent
          isMobile && "pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1", 
          className
        )}
        style={{ ['--sidebar-indent-base' as string]: '1rem' }} // Base indent, adjust as needed
        {...props}
      />
    );
  }
);
SidebarMenuSub.displayName = "SidebarMenuSub";


const SidebarMenuSkeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean, showText?: boolean }>(
  ({ className, showIcon: propShowIcon, showText: propShowText, ...props }, ref) => {
    const { state, isMobile, collapsible } = useSidebar(); 
    const isCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); 

    const showIcon = propShowIcon === undefined ? true : propShowIcon;
    const showText = propShowText === undefined ? true : propShowText;


    useEffect(() => {
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []);


    return (
      <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn(
          "h-9 w-full rounded-md flex items-center gap-2.5", 
          isCollapsed ? "justify-center px-1" : "px-2.5", // Adjusted padding for collapsed
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
  RadixSheetClose, 
}
