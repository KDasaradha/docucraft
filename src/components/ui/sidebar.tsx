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
import { SheetTitle as RadixSheetTitleFromSheet, SheetClose as RadixSheetCloseFromSheetOriginal } from "@/components/ui/sheet";


// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "resizable" | "offcanvas";


const DEFAULT_EXPANDED_WIDTH_REM = 16;
const SIDEBAR_WIDTH_ICON_REM = 3.5;
const MIN_RESIZE_WIDTH_REM = 12;
const MAX_RESIZE_WIDTH_REM = 24;
const LOCAL_STORAGE_SIDEBAR_WIDTH_KEY = "sidebarWidthPx";
const RESIZE_COLLAPSE_THRESHOLD_PX = 30; // Consider a threshold for collapsing when resizing


interface SidebarContextProps {
  collapsible: CollapsibleType
  state: SidebarState
  isMobile: boolean | undefined // Can be undefined during SSR
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  sidebarWidthPx: number
  setSidebarWidthPx: (width: number) => void
  isResizing: boolean
  handleMouseDownOnResizeHandle: (e: React.MouseEvent<HTMLDivElement>) => void;
  defaultOpen?: boolean;
  initialCollapsible?: CollapsibleType;
  defaultWidthPx: number; // Added for clarity
  iconWidthPx: number;    // Added for clarity
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
  collapsible: initialCollapsible = "resizable",
  initialSidebarWidth = `${DEFAULT_EXPANDED_WIDTH_REM}rem`,
}: SidebarProviderProps) {
  const isMobileView = useIsMobile() // This hook now handles undefined state for SSR
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)
  const [isResizing, setIsResizing] = useState(false);

  const [remInPx, setRemInPx] = useState(16); // Default, will update on client

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const updateRemInPx = () => setRemInPx(parseFloat(getComputedStyle(document.documentElement).fontSize));
        updateRemInPx(); // Initial calculation
        window.addEventListener('resize', updateRemInPx);
        return () => window.removeEventListener('resize', updateRemInPx);
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
    // Determine if sidebar should collapse based on resize
    if (initialCollapsible === 'resizable' && clampedWidth <= iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) {
        setIsCollapsedInternal(true);
    } else if (initialCollapsible === 'resizable' && clampedWidth > iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) {
        setIsCollapsedInternal(false);
    }

  }, [minWidthPx, maxWidthPx, iconWidthPx, initialCollapsible]);

  const effectiveCollapsible = isMobileView === undefined ? initialCollapsible : (isMobileView ? "offcanvas" : initialCollapsible);

  const state = useMemo<SidebarState>(() => {
    if (isMobileView === undefined) {
      return defaultOpen ? "expanded" : "collapsed";
    }
    if (isMobileView) return "offcanvas"
    
    if (effectiveCollapsible === 'resizable' && sidebarWidthPx <= iconWidthPx + RESIZE_COLLAPSE_THRESHOLD_PX) {
        return "collapsed";
    }
    return isCollapsedInternal ? "collapsed" : "expanded"
  }, [isMobileView, isCollapsedInternal, effectiveCollapsible, sidebarWidthPx, iconWidthPx, defaultOpen])


  const toggleSidebar = useCallback(() => {
    if (isMobileView) {
      setOpenMobile((prev) => !prev)
    } else if (effectiveCollapsible === 'resizable') {
      if (state === 'expanded') {
        setSidebarWidthPx(iconWidthPx); 
        setIsCollapsedInternal(true);
      } else {
        setSidebarWidthPx(defaultWidthPx); 
        setIsCollapsedInternal(false);
      }
    } else { 
      setIsCollapsedInternal((prev) => !prev)
    }
  }, [isMobileView, effectiveCollapsible, state, sidebarWidthPx, iconWidthPx, setSidebarWidthPx, defaultWidthPx, setIsCollapsedInternal, setOpenMobile]);


  useEffect(() => {
    if (isMobileView === false) { 
      setOpenMobile(false) 
    }
  }, [isMobileView])

  const handleMouseDownOnResizeHandle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileView || effectiveCollapsible !== 'resizable' || state === 'collapsed') return;
    e.preventDefault();
    setIsResizing(true);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
  }, [isMobileView, effectiveCollapsible, state]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setSidebarWidthPx(e.clientX);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (typeof document !== 'undefined') {
          document.body.style.cursor = 'default';
          document.body.style.userSelect = 'auto';
        }
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

  const currentSidebarWidthPx = useMemo(() => {
    if (isMobileView) return defaultWidthPx; // Mobile sidebar uses fixed default width when open
    if (state === 'collapsed') return iconWidthPx;
    return sidebarWidthPx;
  }, [isMobileView, state, sidebarWidthPx, iconWidthPx, defaultWidthPx]);


  useEffect(() => {
    if (typeof window !== "undefined" && isMobileView !== undefined) {
      const root = document.documentElement;
      // For mobile offcanvas, its width is handled by sheet component (usually a % or fixed)
      // For desktop:
      const widthToSet = isMobileView ? '0px' : // Not applicable for main content margin when sidebar is offcanvas
                         (state === 'expanded' ? `${currentSidebarWidthPx}px` : `${iconWidthPx}px`);
      
      root.style.setProperty('--current-sidebar-width', widthToSet);
      root.style.setProperty('--sidebar-width-icon', `${iconWidthPx}px`);
      root.style.setProperty('--sidebar-width-default', `${defaultWidthPx}px`);
      root.style.setProperty('--sidebar-width-min', `${minWidthPx}px`);
      root.style.setProperty('--sidebar-width-max', `${maxWidthPx}px`);
    }
  }, [currentSidebarWidthPx, state, isMobileView, iconWidthPx, defaultWidthPx, minWidthPx, maxWidthPx]);


  const RadixSheetRoot = DialogPrimitive.Root;

  const contextValue: SidebarContextProps = {
    collapsible: effectiveCollapsible,
    state,
    isMobile: isMobileView,
    openMobile,
    setOpenMobile,
    toggleSidebar,
    sidebarWidthPx: currentSidebarWidthPx, // Use the memoized current width
    setSidebarWidthPx,
    isResizing,
    handleMouseDownOnResizeHandle,
    defaultOpen,
    initialCollapsible,
    defaultWidthPx,
    iconWidthPx
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <RadixSheetRoot open={isMobileView && openMobile} onOpenChange={(open) => isMobileView && setOpenMobile(open)}>
          <div className="group/sidebar-wrapper flex h-full w-full" data-state={state}
            style={{ ['--current-sidebar-width' as string]: !isMobileView ? `${currentSidebarWidthPx}px` : '0px', }}
          >
            {!isMobileView && effectiveCollapsible !== "offcanvas" && (
              <div
                className={cn(
                  "hidden md:block flex-shrink-0", // No transition here, width is controlled by style
                   isResizing && "transition-none" // Prevent transition during resize
                )}
                style={{ width: state === 'collapsed' ? `var(--sidebar-width-icon)` : `${currentSidebarWidthPx}px` }}
                aria-hidden="true"
              />
            )}
            {children}
          </div>
        </RadixSheetRoot>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

const RadixSheetTriggerOriginal = DialogPrimitive.Trigger;
const RadixSheetCloseOriginal = DialogPrimitive.Close; // Define it for internal use if needed
const RadixSheetPortal = DialogPrimitive.Portal;

const RadixSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
RadixSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-sidebar text-sidebar-foreground shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-full w-[var(--sidebar-width-default)] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
);
interface MobileSheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof sheetVariants> {}

const MobileSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MobileSheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <RadixSheetPortal>
    <RadixSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      onOpenAutoFocus={(e) => e.preventDefault()}
      {...props}
    >
      {children}
      {/* Close button inside SheetHeader now */}
    </DialogPrimitive.Content>
  </RadixSheetPortal>
));
MobileSheetContent.displayName = "MobileSheetContent";


const sidebarVariants = cva(
  "flex flex-col group fixed top-[var(--header-height)] bottom-0 left-0 z-30", // removed transition-all
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md",
      },
      collapsibleType: {
        icon: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width-default)]",
        button: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width-default)]",
        resizable: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:[--current-sidebar-width]",
        offcanvas: "w-[var(--sidebar-width-default)]", 
      },
      isResizing: {
        true: "transition-none cursor-ew-resize",
        false: "transition-width duration-200 ease-in-out", // Apply transition only when not resizing
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
  ({ className, variant, children, ...props }, ref) => {
  const {
    state,
    isMobile,
    openMobile, 
    setOpenMobile,
    isResizing: contextIsResizing,
    collapsible: contextCollapsible,
    sidebarWidthPx, // current actual width for resizable
    iconWidthPx,
    defaultWidthPx,
    handleMouseDownOnResizeHandle
  } = useSidebar()


  if (isMobile) {
    return (
      // RadixSheetTrigger is handled in AppHeader for mobile
      // SheetContent is rendered here
      <MobileSheetContent side="left" className={cn("p-0 flex flex-col w-[var(--sidebar-width-default)]", className)} open={openMobile} onOpenChange={setOpenMobile} {...props}>
        {children}
      </MobileSheetContent>
    )
  }

  // Desktop view
  const currentDeskWidth = state === 'collapsed' ? iconWidthPx : sidebarWidthPx;

  return (
    <aside
      ref={ref}
      className={cn(
        sidebarVariants({ variant, collapsibleType: contextCollapsible, isResizing: contextIsResizing }),
        className
      )}
      style={{ width: `${currentDeskWidth}px` }} // Directly set width from state
      data-state={state}
      {...props}
    >
      {children}
      {contextCollapsible === 'resizable' && state === 'expanded' && (
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
    const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();

    if (typeof isMobile !== 'boolean' || !isMobile) {
        return <div className={cn("md:hidden", props.className)} style={{width: '2.5rem', height: '2.5rem'}}/>;
    }
    
    return (
      <RadixSheetTriggerOriginal asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar} 
          aria-label="Toggle sidebar"
          className={cn(props.className)}
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
             <RadixSheetCloseOriginal asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenMobile(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close menu</span>
                </Button>
             </RadixSheetCloseOriginal>
           )}
        </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader"


const SidebarContent = forwardRef<
  React.ElementRef<typeof ScrollArea>, // Changed to ScrollArea for consistency
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
}


const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "li";
    return (
      // @ts-ignore next-line
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
            isCollapsed && "sr-only", // Hide text visually but keep for screen readers if tooltip is primary
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
          isCollapsed ? "justify-center px-0 h-9" : `pl-${2 + Math.min(level * 1, 4)}`, // Use Math.min to cap indent
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
           "group-data-[state=collapsed]/sidebar-wrapper:hidden overflow-hidden",
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
    const { state, isMobile, collapsible } = useSidebar(); 
    const isCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";
    
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
  RadixSheetCloseOriginal as SheetClose,
}
