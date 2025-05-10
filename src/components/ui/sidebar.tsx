// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, GripVertical, ChevronDown, ChevronRight } from "lucide-react"; // Added ChevronDown and ChevronRight
import { cn } from "@/lib/utils"
// Slot is not used here anymore based on previous fix.
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
// Import the specific components needed from sheet.tsx
import {
  Sheet as RadixSheetRoot, // Alias for clarity
  SheetTrigger as RadixSheetTriggerOriginal, // Alias for clarity
  SheetClose as RadixSheetCloseOriginal, // Alias for clarity
  SheetPortal as RadixSheetPortal, // Alias for clarity
  SheetOverlay as RadixSheetOverlay, // Alias for clarity
  SheetContent as RadixSheetContentOriginal, // Alias for clarity
  SheetHeader as RadixSheetHeader, // Alias for clarity
  SheetTitle as RadixSheetTitleOriginal, // Alias for clarity
  SheetDescription as RadixSheetDescriptionOriginal, // Alias for clarity
  SheetFooter as RadixSheetFooter // Alias for clarity
} from "@/components/ui/sheet";


// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "offcanvas" | "resizable";


const DEFAULT_EXPANDED_WIDTH_REM = 16; // 16rem = 256px at 16px/rem
const SIDEBAR_WIDTH_ICON_REM = 3.5; // 3.5rem = 56px
const LOCAL_STORAGE_SIDEBAR_WIDTH_KEY = "sidebarWidthPx";

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
  sidebarWidth: number 
  setSidebarWidth: (width: number) => void
  isResizing: boolean
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>
  minWidthPx: number
  maxWidthPx: number
  defaultWidthPx: number
  iconWidthPx: number
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
  collapsible: initialCollapsible = "resizable", // Default to resizable
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
    }
  }, []);

  const defaultWidthPx = useMemo(() => parseFloat(initialSidebarWidth) * remInPx, [initialSidebarWidth, remInPx]);
  const minWidthPx = useMemo(() => {
      if (typeof document === 'undefined') return 12 * 16; // SSR fallback
      const minRem = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-min').replace('rem', '')) || 12;
      return minRem * remInPx;
  }, [remInPx]);
  const maxWidthPx = useMemo(() => {
      if (typeof document === 'undefined') return 24 * 16; // SSR fallback
      const maxRem = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-max').replace('rem', '')) || 24;
      return maxRem * remInPx;
  }, [remInPx]);
  const iconWidthPx = useMemo(() => SIDEBAR_WIDTH_ICON_REM * remInPx, [remInPx]);


  const [sidebarWidth, setSidebarWidthState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedWidth = localStorage.getItem(LOCAL_STORAGE_SIDEBAR_WIDTH_KEY);
      if (storedWidth) return parseInt(storedWidth, 10);
    }
    return defaultWidthPx; 
  });


  const setSidebarWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.max(minWidthPx, Math.min(newWidth, maxWidthPx));
    setSidebarWidthState(clampedWidth);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_SIDEBAR_WIDTH_KEY, clampedWidth.toString());
    }
  }, [minWidthPx, maxWidthPx]);

  const collapsible = isMobileView ? "offcanvas" : initialCollapsible

  const state = useMemo<SidebarState>(() => {
    if (isMobileView) return "offcanvas"
    if (collapsible === 'resizable' && sidebarWidth <= iconWidthPx + 30) return "collapsed"; // Threshold for resizable collapse
    return isCollapsedInternal ? "collapsed" : "expanded"
  }, [isMobileView, isCollapsedInternal, collapsible, sidebarWidth, iconWidthPx])

  const toggleSidebar = useCallback(() => {
    if (isMobileView) {
      setOpenMobile((prev) => !prev)
    } else if (collapsible === 'resizable') {
      // For resizable, toggle between default expanded and icon width
      if (sidebarWidth > iconWidthPx) {
        setSidebarWidth(iconWidthPx);
        setIsCollapsedInternal(true);
      } else {
        setSidebarWidth(defaultWidthPx);
        setIsCollapsedInternal(false);
      }
    } else { // For icon and button collapsible types
      setIsCollapsedInternal((prev) => !prev)
    }
  }, [isMobileView, collapsible, sidebarWidth, iconWidthPx, setSidebarWidth, defaultWidthPx])

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
        root.style.setProperty('--current-sidebar-width', `${sidebarWidth}px`);
      } else if (state === 'collapsed' && !isMobileView) {
        root.style.setProperty('--sidebar-width', `var(--sidebar-width-icon)`); // Use CSS var for collapsed icon state
        root.style.setProperty('--current-sidebar-width', `var(--sidebar-width-icon)`);
      } else { // Mobile or offcanvas
        root.style.setProperty('--sidebar-width', `${defaultWidthPx}px`); // Default width for mobile sheet
        root.style.setProperty('--current-sidebar-width', '0px'); // No persistent sidebar influencing margin
      }
    }
  }, [sidebarWidth, state, isMobileView, defaultWidthPx]);
  
  // Global mouse event listeners for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isMobileView || collapsible !== 'resizable') return;
      setSidebarWidth(e.clientX);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (isResizing && collapsible === 'resizable') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
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
  }, [isResizing, setSidebarWidth, isMobileView, collapsible]);


  const contextValue: SidebarContextProps = {
    collapsible,
    state,
    isMobile: isMobileView,
    openMobile,
    setOpenMobile,
    toggleSidebar,
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    setIsResizing,
    minWidthPx,
    maxWidthPx,
    defaultWidthPx,
    iconWidthPx
  };

  if (isMobileView === undefined) { // SSR or before hydration
    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
           <div className="group/sidebar-wrapper flex h-full w-full" data-state="collapsed">
             <div
                className="hidden md:block flex-shrink-0 transition-all duration-200 ease-in-out w-[var(--sidebar-width-icon)]"
                aria-hidden="true"
             />
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }

  if (isMobileView) {
    // On mobile, RadixSheetRoot wraps the context provider and children
    return (
      <RadixSheetRoot open={openMobile} onOpenChange={setOpenMobile}>
        <SidebarContext.Provider value={contextValue}>
          <TooltipProvider delayDuration={0}>
            <div className="group/sidebar-wrapper flex h-full w-full" data-state="offcanvas">
              {children}
            </div>
          </TooltipProvider>
        </SidebarContext.Provider>
      </RadixSheetRoot>
    );
  }

  // Desktop view
  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          className="group/sidebar-wrapper flex h-full w-full"
          data-state={state}
           style={{ ['--current-sidebar-width' as string]: state === 'collapsed' ? `${iconWidthPx}px` : `${sidebarWidth}px` }}
        >
           {collapsible !== "offcanvas" && ( 
             <div
                className={cn(
                  "hidden md:block flex-shrink-0",
                   isResizing ? "!transition-none" : "transition-all duration-200 ease-in-out",
                )}
                style={{ width: state === 'collapsed' ? `${iconWidthPx}px` : `${sidebarWidth}px` }}
                aria-hidden="true"
             />
           )}
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// --- Sidebar Components ---

// Using original Radix components for Sheet parts within Sidebar logic
const Sheet = RadixSheetRoot; // This is DialogPrimitive.Root
const SheetTriggerForSidebar = RadixSheetTriggerOriginal; // Alias for clarity, used by SidebarTrigger
const SheetCloseForSidebar = RadixSheetCloseOriginal; // This is Radix DialogPrimitive.Close, re-exported
const SheetPortalForSidebar = RadixSheetPortal;
const SheetOverlayForSidebar = RadixSheetOverlay;
const SheetContentForMobileSidebar = RadixSheetContentOriginal; // Explicit name for mobile sidebar content
const SheetHeaderForMobileSidebar = RadixSheetHeader;
const SheetTitleForMobileSidebar = RadixSheetTitleOriginal; // Original Radix SheetTitle
const SheetFooterForMobileSidebar = RadixSheetFooter;


const sidebarVariants = cva(
  "flex flex-col transition-all duration-200 ease-in-out group fixed top-[var(--header-height)] bottom-0 left-0 z-30",
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
    state, collapsible: contextCollapsible, sidebarWidth, 
    setIsResizing, isResizing: contextIsResizing, iconWidthPx, defaultWidthPx
  } = useSidebar()
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state !== 'expanded' || contextCollapsible !== 'resizable' || isMobile) return;
    e.preventDefault();
    setIsResizing(true);
  }, [state, contextCollapsible, isMobile, setIsResizing]);

  if (isMobile) {
    // For mobile, Sidebar effectively becomes the SheetContent
    return (
        <SheetContentForMobileSidebar 
            side="left" 
            className={cn("p-0 flex flex-col", className)} 
            style={{ width: `${defaultWidthPx}px` }} // Use defaultWidthPx for mobile sheet
            {...props}
        >
          {children}
        </SheetContentForMobileSidebar>
    );
  }

  // Desktop <aside> element
  return (
    <aside
      ref={ref}
      className={cn(
        sidebarVariants({ variant, isResizing: contextIsResizing }),
        className
      )}
      style={{ width: state === 'collapsed' ? `${iconWidthPx}px` : `${sidebarWidth}px` }}
      data-state={state}
      {...props}
    >
      {children}
      {state === 'expanded' && contextCollapsible === 'resizable' && !isMobile && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 right-0 h-full w-1.5 cursor-ew-resize group-hover/sidebar-wrapper:bg-primary/10 active:bg-primary/20 z-10",
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
    const { toggleSidebar, isMobile } = useSidebar();
    
    if (typeof isMobile !== 'boolean' || !isMobile ) {
         return null; 
    }
    
    // This RadixSheetTrigger is the actual button that opens the mobile sidebar
    return (
      <SheetTriggerForSidebar asChild>
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
      </SheetTriggerForSidebar>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isResizing, state } = useSidebar();
    return (
      <RadixSheetHeader // Using Radix SheetHeader for mobile semantic structure
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
      </RadixSheetHeader>
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
  hasSubItems?: boolean // For styling and arrow indicator logic
  isOpen?: boolean // To control arrow direction
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
          isCollapsed ? "justify-center px-0" : `pl-${2 + (level * 1.5 > 6 ? 6 : level * 1.5)}`, 
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
            {/* When asChild is true, TooltipTrigger expects a single valid React child */}
             {asChild && React.isValidElement(children) ? (
                React.cloneElement(children as React.ReactElement<any>, {
                  // Ensure the child passed to Button also gets these props if it's a custom component
                  // For simple DOM elements or ShadCN Button, this might not be strictly necessary
                  // but good for robustness with custom asChild components.
                  className: cn(
                    (children as React.ReactElement<any>).props.className,
                    "h-9 w-full justify-center",
                    className
                  ),
                  variant: isActive ? "sidebarAccent" : "ghostSidebar"
                })
             ) : (
                <Button
                  ref={ref} 
                  variant={isActive ? "sidebarAccent" : "ghostSidebar"}
                  className={cn("h-9 w-full justify-center", className)} 
                  // asChild={asChild} // asChild is handled by TooltipTrigger if button is direct child
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
    const isCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";

    if (isCollapsed && !isMobile) return null; 

    return (
      <ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 group-data-[state=collapsed]/sidebar-wrapper:hidden pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1", 
           "[&_ul]:pl-[calc(var(--sidebar-indent-base)_/_2)]", 
          isMobile && "pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1", 
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
  ({ className, showIcon: propShowIcon, showText: propShowText, ...props }, ref) => {
    const { state, isMobile, collapsible } = useSidebar();
    const isActuallyCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";

    const showIcon = propShowIcon === undefined ? true : propShowIcon;
    let showTextFinal = propShowText === undefined ? (!isActuallyCollapsed || isMobile) : propShowText;
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); 

    useEffect(() => {
      // This check ensures Math.random is only called on the client side
      if (typeof window !== 'undefined') {
        setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
      }
    }, []);


    return (
      <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn(
          "h-9 w-full rounded-md flex items-center gap-2.5",
          (isActuallyCollapsed && !isMobile) ? "justify-center px-1.5" : "px-2.5", 
          className
        )}
        {...props}
      >
        {showIcon && !isActuallyCollapsed && (
           <Skeleton
            className={cn((isActuallyCollapsed && !isMobile) ? "size-5" : "size-4", "rounded-md bg-sidebar-foreground/10")} 
            data-sidebar="menu-skeleton-icon"
          />
        )}
         {showIcon && isActuallyCollapsed && (
           <Skeleton
            className="size-5 rounded-md bg-sidebar-foreground/10"
            data-sidebar="menu-skeleton-icon"
          />
        )}
        {showTextFinal && ( 
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
  SheetCloseForSidebar as SheetClose, // Re-export the aliased SheetClose
  SheetTitleForMobileSidebar as SheetTitle // Re-export RadixSheetTitle as SheetTitle
}
  

