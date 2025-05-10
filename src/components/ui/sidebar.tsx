// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, GripVertical } from "lucide-react" 
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
  Sheet as RadixSheetRoot, // Renamed to avoid conflict with local Sheet export
  SheetTrigger as RadixSheetTriggerOriginal, // Alias
  SheetClose as RadixSheetCloseOriginal, // Alias
  SheetPortal as RadixSheetPortalOriginal, // Alias
  SheetOverlay as RadixSheetOverlayOriginal, // Alias
  SheetContent as RadixSheetContentOriginal, // Alias
  SheetHeader as RadixSheetHeaderOriginal,   // Alias
  SheetTitle as RadixSheetTitleOriginal,     // Alias to make it clear it's from Radix/Sheet
  SheetFooter as RadixSheetFooterOriginal,   // Alias
  SheetDescription as RadixSheetDescriptionOriginal // Alias
} from "@/components/ui/sheet";

// --- Sidebar Context ---
type SidebarState = "expanded" | "collapsed" | "offcanvas"
type CollapsibleType = "icon" | "button" | "offcanvas"

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
  collapsible: initialCollapsible = "icon",
  initialSidebarWidth = `${DEFAULT_EXPANDED_WIDTH_REM}rem`,
}: SidebarProviderProps) {
  const isMobileView = useIsMobile() 
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)
  const [isResizing, setIsResizing] = useState(false);
  
  const [remInPx, setRemInPx] = useState(16); // Default, will update on client

  useEffect(() => {
    setRemInPx(getRemInPx());
  }, []);

  const defaultWidthPx = useMemo(() => parseFloat(initialSidebarWidth) * remInPx, [initialSidebarWidth, remInPx]);
  const minWidthPx = useMemo(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-min') || `${12 * remInPx}`) * remInPx, [remInPx]);
  const maxWidthPx = useMemo(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width-max') || `${24 * remInPx}`) * remInPx, [remInPx]);
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
        root.style.setProperty('--current-sidebar-width', `${sidebarWidth}px`);
      } else if (state === 'collapsed' && !isMobileView) {
        root.style.setProperty('--sidebar-width', `var(--sidebar-width-icon)`);
        root.style.setProperty('--current-sidebar-width', `var(--sidebar-width-icon)`);
      } else { 
        root.style.setProperty('--sidebar-width', `${defaultWidthPx}px`);
        root.style.setProperty('--current-sidebar-width', '0px'); 
      }
    }
  }, [sidebarWidth, state, isMobileView, defaultWidthPx]);
  
  // Global mouse event listeners for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isMobileView || state === 'collapsed' || collapsible === 'icon') return;
      setSidebarWidth(e.clientX);
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
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
       if (document.body.style.cursor === 'ew-resize') {
        document.body.style.cursor = 'default';
      }
      if (document.body.style.userSelect === 'none') {
         document.body.style.userSelect = 'auto';
      }
    };
  }, [isResizing, setSidebarWidth, isMobileView, state, collapsible]);


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

  if (isMobileView === undefined) {
    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }

  if (isMobileView) {
    return (
      <RadixSheetRoot open={openMobile} onOpenChange={setOpenMobile}>
        <SidebarContext.Provider value={contextValue}>
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </SidebarContext.Provider>
      </RadixSheetRoot>
    );
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          className="group/sidebar-wrapper flex h-full w-full"
          data-state={state}
           style={{ ['--current-sidebar-width' as string]: state === 'collapsed' ? `${iconWidthPx}px` : `${sidebarWidth}px` }}
        >
           {!isMobileView && collapsible !== "offcanvas" && (
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

const Sheet = DialogPrimitive.Root
const SheetTriggerOriginal = DialogPrimitive.Trigger // Alias for clarity
const SheetClose = DialogPrimitive.Close
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
        left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
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
>(({ side = "left", className, children, ...props }, ref) => {
  const { defaultWidthPx } = useSidebar();
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        style={{ width: `${defaultWidthPx}px` }}
        onOpenAutoFocus={(e) => e.preventDefault()} 
        {...props}
      >
        {children}
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
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

const SheetTitle = RadixSheetTitle; // Use the imported RadixSheetTitle
const SheetDescription = RadixSheetDescriptionOriginal;


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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  collapsible?: CollapsibleType
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsible, children, ...props }, ref) => {
  const { isMobile, openMobile, setOpenMobile, state, collapsible: contextCollapsible, sidebarWidth, setIsResizing, isResizing: contextIsResizing, iconWidthPx } = useSidebar()
  const effectiveCollapsible = collapsible || contextCollapsible;
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state !== 'expanded' || effectiveCollapsible === 'icon' || isMobile) return;
    e.preventDefault();
    setIsResizing(true);
  }, [state, effectiveCollapsible, isMobile, setIsResizing]);

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTriggerOriginal asChild>
          {/* The actual trigger button is in AppHeader, this div is just to satisfy asChild */}
          <div /> 
        </SheetTriggerOriginal>
        <SheetContent side="left" className={cn("p-0 flex flex-col", className)} {...props}>
          {/* SheetTitle should be used by the consumer, e.g., AppSidebarClient */}
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      ref={ref}
      className={cn(
        sidebarVariants({ variant, isResizing: contextIsResizing }),
        state === 'collapsed' ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]",
        className
      )}
      style={{ width: state === 'collapsed' ? `${iconWidthPx}px` : `${sidebarWidth}px` }}
      data-state={state}
      {...props}
    >
      {children}
      {state === 'expanded' && effectiveCollapsible !== 'offcanvas' && effectiveCollapsible !== 'icon' && !isMobile && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 right-0 h-full w-1.5 cursor-ew-resize group-hover/sidebar-wrapper:bg-primary/10 active:bg-primary/20 z-10",
            "transition-colors duration-150 ease-in-out",
             contextIsResizing && "bg-primary/20"
          )}
          title="Resize sidebar"
        >
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover/sidebar-wrapper:opacity-70 group-data-[resizing=true]/sidebar-wrapper:opacity-70 transition-opacity"/>
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
       return null; // Don't render if isMobile is undefined or false
    }
    
    // This RadixSheetTriggerOriginal is just for the context, actual button rendered here.
    return (
      <RadixSheetTriggerOriginal asChild>
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
      </RadixSheetTriggerOriginal>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isResizing } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
          "group-data-[state=collapsed]/sidebar-wrapper:justify-center group-data-[state=expanded]/sidebar-wrapper:justify-between",
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
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("space-y-0.5 py-2",
        "group-data-[state=expanded]/sidebar-wrapper:px-2",
        "group-data-[state=collapsed]/sidebar-wrapper:px-1.5"
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
         {hasSubItems && (!isCollapsed || useSidebar().isMobile ) && ( 
           isOpen ? <X className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" /> : <Menu className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        )}
      </>
    )

    const buttonElement = (
      <Button
        ref={ref}
        variant={isActive ? "sidebarAccent" : "ghostSidebar"}
        className={cn(
          "h-auto min-h-[2.25rem] w-full justify-start items-center gap-2.5 text-sm px-2.5 py-1.5",
          isCollapsed && "justify-center px-0",
          !isCollapsed && `pl-${2 + (level * 1.5 > 6 ? 6 : level * 1.5)}`, 
          className
        )}
        asChild={asChild}
        {...props}
      >
        {asChild ? children : content} 
      </Button>
    );


    if (isCollapsed && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref} 
              variant={isActive ? "sidebarAccent" : "ghostSidebar"}
              className={cn("h-9 w-full justify-center", className)} 
              asChild={asChild}
              {...props} 
            >
               {asChild ? children : (
                <>
                  {Icon && <Icon className="size-5 shrink-0" />}
                  <span className="sr-only">{tooltip}</span>
                </>
              )}
            </Button>
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
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

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
    const isCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";

    const showIcon = propShowIcon === undefined ? true : propShowIcon;
    let showTextFinal = propShowText === undefined ? !isCollapsed : propShowText;
    if (isMobile) showTextFinal = true;


    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%');

    useEffect(() => {
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []);


    return (
      <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn(
          "h-9 w-full rounded-md flex items-center gap-2.5",
          (isCollapsed && !isMobile) ? "justify-center px-1.5" : "px-2.5",
          className
        )}
        {...props}
      >
        {showIcon && (
           <Skeleton
            className={cn((isCollapsed && !isMobile) ? "size-5" : "size-4", "rounded-md bg-sidebar-foreground/10")}
            data-sidebar="menu-skeleton-icon"
          />
        )}
        {showTextFinal && (
          <Skeleton
            className="h-4 flex-1 rounded-sm bg-sidebar-foreground/10"
            data-sidebar="menu-skeleton-text"
            style={{maxWidth: skeletonTextWidth }}
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
}
    
