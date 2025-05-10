// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, GripVertical, ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetTitle as RadixSheetTitleFromSheet, SheetClose as RadixSheetCloseFromSheet } from "@/components/ui/sheet";


// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "resizable" | "offcanvas";


const DEFAULT_EXPANDED_WIDTH_REM = 16;
const SIDEBAR_WIDTH_ICON_REM = 3.5;
const MIN_RESIZE_WIDTH_REM = 12;
const MAX_RESIZE_WIDTH_REM = 24;
const LOCAL_STORAGE_SIDEBAR_WIDTH_KEY = "sidebarWidthPx";
const RESIZE_COLLAPSE_THRESHOLD_PX = 30;

const getRemInPx = () => {
  if (typeof window === 'undefined') return 16; // Default for SSR
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

  const [remInPx, setRemInPx] = useState(16); // Default, will update on client

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
    // Initialize with defaultWidthPx, localStorage will override on client if available
    return defaultWidthPx;
  });

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure localStorage is accessed only on client
      const storedWidth = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_WIDTH_KEY);
      if (storedWidth) {
        setSidebarWidthState(Math.max(minWidthPx, Math.min(parseInt(storedWidth, 10), maxWidthPx)));
      } else {
        setSidebarWidthState(defaultWidthPx); // Fallback to default if nothing in localStorage
      }
    }
  }, [minWidthPx, maxWidthPx, defaultWidthPx]); // Rerun if these change (e.g., remInPx changes)


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
      // SSR or initial render before hydration, rely on defaultOpen
      return defaultOpen ? "expanded" : "collapsed";
    }
    if (isMobileView) return "offcanvas" // Mobile view always uses offcanvas logic
    // Desktop view
    if (effectiveCollapsible === 'resizable' && sidebarWidthPx <= iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) return "collapsed";

    return isCollapsedInternal ? "collapsed" : "expanded"
  }, [isMobileView, isCollapsedInternal, effectiveCollapsible, sidebarWidthPx, iconWidthPx, defaultOpen])


  const toggleSidebar = useCallback(() => {
    if (isMobileView) {
      setOpenMobile((prev) => !prev)
    } else if (effectiveCollapsible === 'resizable') {
      // If currently expanded (and wider than collapse threshold), collapse to icon width
      // If currently collapsed (at icon width), expand to default width
      if (sidebarWidthPx > iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) {
        setSidebarWidthPx(iconWidthPx); // Collapse
      } else {
        setSidebarWidthPx(defaultWidthPx); // Expand to default
      }
      // Also toggle the internal collapsed state for non-resizable types
      setIsCollapsedInternal(prev => sidebarWidthPx <= iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX ? !prev : prev);

    } else { // For 'icon' or 'button' collapsible types
      setIsCollapsedInternal((prev) => !prev)
    }
  }, [isMobileView, effectiveCollapsible, sidebarWidthPx, iconWidthPx, setSidebarWidthPx, defaultWidthPx])

  useEffect(() => {
    if (isMobileView === false) { // When switching from mobile to desktop
      setOpenMobile(false) // Close mobile menu
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
      if (typeof document !== 'undefined' && document.body.style.cursor === 'ew-resize') { // Check if style was set
        document.body.style.cursor = 'default';
      }
      if (typeof document !== 'undefined' && document.body.style.userSelect === 'none') { // Check if style was set
         document.body.style.userSelect = 'auto';
      }
    };
  }, [isResizing, setSidebarWidthPx]);


  useEffect(() => {
    if (typeof window !== "undefined" && isMobileView !== undefined) { // Ensure this runs only client-side after hydration
      const root = document.documentElement;
      const currentSidebarWidth = isMobileView
        ? (openMobile ? defaultWidthPx : 0) // For mobile, width is either default or 0 (when closed)
        : (state === 'expanded' ? sidebarWidthPx : iconWidthPx);

      root.style.setProperty('--current-sidebar-width', `${currentSidebarWidth}px`);
      root.style.setProperty('--sidebar-width-icon', `${iconWidthPx}px`);
      root.style.setProperty('--sidebar-width', `${defaultWidthPx}px`); // Base default expanded width
    }
  }, [sidebarWidthPx, state, isMobileView, openMobile, iconWidthPx, defaultWidthPx]);

  // Radix Sheet components for mobile off-canvas sidebar
  const MobileSheetRoot = DialogPrimitive.Root;
  // const MobileSheetTrigger = DialogPrimitive.Trigger; // Not directly used here, trigger is in AppHeader
  const MobileSheetClose = DialogPrimitive.Close; // For potential use in mobile sheet header
  const MobileSheetPortal = DialogPrimitive.Portal;

  const MobileSheetOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
  >(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className // z-40 to be below header's z-50 if header isn't part of sheet
      )}
      {...props}
      ref={ref}
    />
  ));
  MobileSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

  const mobileSheetVariants = cva(
    "fixed z-50 gap-4 bg-sidebar text-sidebar-foreground shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
    {
      variants: {
        side: {
          left: "inset-y-0 left-0 h-full w-[var(--sidebar-width)] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
        },
      },
      defaultVariants: {
        side: "left",
      },
    }
  );
  interface MobileSheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof mobileSheetVariants> {}

  const MobileSheetContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    MobileSheetContentProps
  >(({ side = "left", className, children, ...props }, ref) => (
    <MobileSheetPortal>
      <MobileSheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(mobileSheetVariants({ side }), className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        {...props}
      >
        {children}
          {/* Close button is part of MobileSheetContent */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </MobileSheetPortal>
  ));
  MobileSheetContent.displayName = DialogPrimitive.Content.displayName;


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
         {/* Mobile Sheet Root. The trigger is in AppHeader. */}
        <MobileSheetRoot open={isMobileView && openMobile} onOpenChange={(open) => isMobileView && setOpenMobile(open)}>
          <div className="group/sidebar-wrapper flex h-screen w-full" data-state={state}> {/* h-screen ensures full height */}
            {children}
          </div>
        </MobileSheetRoot>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}


const sidebarVariants = cva(
  "hidden md:flex flex-col transition-all duration-200 ease-in-out group fixed top-[var(--header-height)] bottom-0 left-0 z-30",
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md",
      },
      collapsibleType: {
        icon: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width)]",
        button: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width)]",
        resizable: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--current-sidebar-width)]", // Use --current-sidebar-width for resizable
        offcanvas: "w-[var(--sidebar-width)]", // Should not be applied on desktop
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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsibleType, children, ...props }, ref) => {
  const {
    state,
    isMobile,
    // openMobile, setOpenMobile, // Not directly used by Desktop Sidebar, handled by Provider
    isResizing: contextIsResizing,
    sidebarWidthPx,
    iconWidthPx,
    handleMouseDownOnResizeHandle,
    collapsible: contextCollapsible
  } = useSidebar()

  const effectiveCollapsibleType = collapsibleType || contextCollapsible;

  if (isMobile) {
    // The actual sheet content for mobile is rendered by AppSidebarClient using MobileSheetContent
    return null;
  }

  // Desktop view
  return (
    <aside
      ref={ref}
      className={cn(
        sidebarVariants({ variant, collapsibleType: effectiveCollapsible, isResizing: contextIsResizing }),
        className
      )}
      style={{ width: state === 'collapsed' && effectiveCollapsibleType !== 'resizable' ? `${iconWidthPx}px` : `${sidebarWidthPx}px` }}
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
 (props, ref) => {
    const { toggleSidebar, isMobile } = useSidebar(); // Removed openMobile, setOpenMobile as they are handled by context

    if (typeof isMobile !== 'boolean') { // SSR / initial render before hydration
        return <div className={cn("md:hidden", props.className)} style={{width: '2.5rem', height: '2.5rem'}}/>;
    }
    if (!isMobile) return null; // Don't render on desktop


    // This component now only needs to toggle the `openMobile` state via context.
    // The actual Sheet root is in SidebarProvider for mobile.
    return (
      <MobileSheetTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar} // This still calls our context's toggle which calls setOpenMobile
          aria-label="Toggle sidebar"
          className={cn(props.className)}
          {...props}
        >
          <Menu />
        </Button>
      </MobileSheetTrigger>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isResizing, state, isMobile, setOpenMobile } = useSidebar();

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
           {isMobile && (
             <MobileSheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenMobile(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close menu</span>
                </Button>
             </MobileSheetClose>
           )}
        </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader"


const SidebarContent = forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
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


const SidebarMenu = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => {
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

interface SidebarMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  asChild?: boolean;
  whileHover?: any; // Allow Framer Motion props
  whileTap?: any;   // Allow Framer Motion props
}


const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "li";
    return (
      // @ts-ignore
      <Comp
        ref={ref}
        className={cn("list-none", className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends ButtonProps {
  icon?: LucideIcon
  label?: string
  isActive?: boolean
  // asChild?: boolean // Already in ButtonProps
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
          isCollapsed ? "justify-center px-0 h-9" : `pl-${2 + Math.min(level * 1, 4)}`,
          className
        )}
        asChild={asChild}
        {...props}
      >
        {asChild && React.isValidElement(children) ? children : content}
      </Button>
    );


    if (isCollapsed && tooltip) {
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


const SidebarMenuSub = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

    if (isCollapsed) return null;

    return (
      <ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1",
           "[&_ul]:pl-[calc(var(--sidebar-indent-base)_/_2)]",
           "group-data-[state=collapsed]/sidebar-wrapper:hidden overflow-hidden", // Added overflow-hidden
          className
        )}
        style={{ ['--sidebar-indent-base' as string]: '1rem' }}
        {...props}
      >
        {children}
      </ul>
    );
  }
);
SidebarMenuSub.displayName = "SidebarMenuSub";


const SidebarMenuSkeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean, showText?: boolean }>(
  ({ className, showIcon = true, showText = true, ...props }, ref) => {
    const { state: sidebarStateHook, isMobile, collapsible } = useSidebar();
    const isCollapsed = !isMobile && sidebarStateHook === "collapsed" && collapsible !== "offcanvas";

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
  // Sheet related exports for sidebar's mobile view
  MobileSheetRoot as Sheet, // Exporting the aliased DialogPrimitive.Root as Sheet
  MobileSheetTrigger as SheetTrigger, // Exporting the aliased DialogPrimitive.Trigger
  MobileSheetClose as SheetClose, // Exporting the aliased DialogPrimitive.Close
  MobileSheetContent as SheetContent, // Exporting the aliased MobileSheetContent
  RadixSheetTitleFromSheet as SheetTitle, // Re-exporting the imported SheetTitle
};
