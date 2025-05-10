// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, GripVertical, ChevronDown, ChevronRight } from "lucide-react"; 
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetTitle as RadixSheetTitleOriginal } from "@/components/ui/sheet"; 
import { motion } from "framer-motion";


// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "offcanvas" | "resizable";


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
      if (isMobileView && openMobile) {
        root.style.setProperty('--sidebar-width', `${defaultWidthPx}px`); 
        root.style.setProperty('--current-sidebar-width', '0px'); 
      } else if (!isMobileView) {
        if (state === 'expanded') {
          root.style.setProperty('--sidebar-width', `${sidebarWidthPx}px`);
          root.style.setProperty('--current-sidebar-width', `${sidebarWidthPx}px`);
        } else if (state === 'collapsed') {
          root.style.setProperty('--sidebar-width', `${iconWidthPx}px`);
          root.style.setProperty('--current-sidebar-width', `${iconWidthPx}px`);
        }
      } else { 
        root.style.setProperty('--current-sidebar-width', '0px');
      }
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
        <DialogPrimitive.Root open={isMobileView && openMobile} onOpenChange={isMobileView ? setOpenMobile : undefined}>
          <div className="group/sidebar-wrapper flex h-full w-full" data-state={state}>
            {children}
          </div>
        </DialogPrimitive.Root>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// --- Sidebar Components ---

const Sheet = DialogPrimitive.Root
const SheetTriggerOriginal = DialogPrimitive.Trigger
const SheetCloseOriginal = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
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
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const sheetVariants = cva(
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
)

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      onOpenAutoFocus={(e) => e.preventDefault()} 
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeaderOriginal = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeaderOriginal.displayName = "SheetHeader"


const sidebarVariants = cva(
  "fixed top-[var(--header-height)] bottom-0 left-0 z-30 flex flex-col transition-all duration-200 ease-in-out group",
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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, children, ...props }, ref) => {
  const { 
    isMobile, 
    state, 
    collapsible: effectiveCollapsible, 
    sidebarWidthPx, 
    isResizing: contextIsResizing, 
    iconWidthPx, 
    handleMouseDownOnResizeHandle
  } = useSidebar()
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isMobile === undefined) {
    // Return a placeholder or null during SSR or before mobile status is known
    return (
        <aside className={cn(
            "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground fixed top-[var(--header-height)] bottom-0 left-0 z-30",
            "w-[var(--sidebar-width-default)]" // Use a default static width or the icon width
          )}
          style={{ width: 'var(--sidebar-width-default)'}} // Ensure this var is defined in globals.css
        >
          {/* Skeleton or minimal content */}
        </aside>
    );
  }
  
  if (isMobile) {
    return (
        // SheetContent already handles the DialogPrimitive.Content.
        // Ensure the props are correctly passed if Sidebar is used as a wrapper.
        // It might be cleaner to use SheetContent directly in AppSidebarClient for mobile.
        // For now, assuming children are passed correctly.
        <SheetContent 
            side="left" 
            className={cn("p-0 flex flex-col", className)} 
            style={{ width: `var(--sidebar-width)` }} // Uses CSS variable for dynamic width
            {...props}
        >
          {children}
        </SheetContent>
    );
  }

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
      {effectiveCollapsible === 'resizable' && state === 'expanded' && (
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
    const { isMobile, toggleSidebar } = useSidebar();
    
    if (typeof isMobile !== 'boolean' || !isMobile ) {
         // Render a placeholder or null if not mobile, or if mobile status is undetermined
         // This helps prevent DialogTrigger from rendering outside Dialog context on desktop
         return null; 
    }

    return (
      // This RadixSheetTrigger is the actual button that opens the mobile sidebar
      <SheetTriggerOriginal asChild>
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
      </SheetTriggerOriginal>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isResizing, state, isMobile } = useSidebar();

    const headerContent = (
        <>
        {isMobile && <RadixSheetTitleOriginal className="sr-only">Main Menu</RadixSheetTitleOriginal>}
        {children}
        {isMobile && (
            <SheetCloseOriginal asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
            </Button>
            </SheetCloseOriginal>
        )}
        </>
    );
    
    return (
      isMobile ? (
        <SheetHeaderOriginal
          ref={ref}
          className={cn(
            "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
            "justify-between", 
            className
          )}
          {...props}
        >
           {headerContent}
        </SheetHeaderOriginal>
      ) : (
        <div
          ref={ref}
          className={cn(
            "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
             state === 'collapsed' ? "justify-center" : "justify-between", 
            isResizing && "!cursor-ew-resize",
            className
          )}
          {...props}
        >
          {children}
        </div>
      )
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
  ({ className, ...props }, ref) => {
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
      />
    );
  }
)
SidebarMenu.displayName = "SidebarMenu"

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  as?: React.ElementType;
}

const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, as: Comp = "li", children, ...props }, ref) => (
    <Comp
      ref={ref}
      className={cn("", className)}
      {...props}
    >
      {children}
    </Comp>
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";


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
         {hasSubItems && (!isCollapsed || (isMobile && isMobile !== undefined) ) && ( 
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
                    isActive ? sidebarVariants({variant: "sidebarAccent"}) : sidebarVariants({variant: "ghostSidebar"}),
                    className
                  ),
                 // variant: isActive ? "sidebarAccent" : "ghostSidebar" // This might be redundant if className sets it
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
  ({ className, ...props }, ref) => {
    const { state, isMobile, collapsible } = useSidebar();
    const isActuallyCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";


    if (isActuallyCollapsed && isMobile === false) return null; 

    return (
      <ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1", 
           "[&_ul]:pl-[calc(var(--sidebar-indent-base)_/_2)]", 
           (isMobile === undefined || !isMobile) && "group-data-[state=collapsed]/sidebar-wrapper:hidden",
          className
        )}
        style={{ ['--sidebar-indent-base' as string]: '1rem' }} 
        {...props}
      />
    );
  }
);
SidebarMenuSub.displayName = "SidebarMenuSub";


const SidebarMenuSkeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean, showText?: boolean }>(
  ({ className, showIcon = true, showText = true, ...props }, ref) => {
    const context = useSidebar(); 
    // Guard against context being undefined during initial SSR passes if SidebarProvider hasn't fully initialized
    const isMobile = context?.isMobile ?? false; // Default to false if context is not ready
    const sidebarState = context?.state ?? 'expanded'; // Default to expanded
    const collapsible = context?.collapsible ?? 'resizable'; // Default
    
    const isCollapsed = !isMobile && sidebarState === "collapsed" && collapsible !== "offcanvas";
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); 

    useEffect(() => {
      // This effect runs only on the client, after hydration
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []);


    return (
      <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn(
          "h-9 w-full rounded-md flex items-center gap-2.5",
          (isCollapsed) ? "justify-center px-1.5" : "px-2.5", 
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
  SheetCloseOriginal as SheetClose,
  RadixSheetTitleOriginal as SheetTitle,
}
