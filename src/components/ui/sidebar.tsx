// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, ChevronDown, ChevronRight, GripVertical } from "lucide-react"
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
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>
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

const DEFAULT_EXPANDED_WIDTH_REM = 16; // 16rem = 256px at 16px/rem
const MIN_SIDEBAR_WIDTH_PX = 192; // 12rem
const MAX_SIDEBAR_WIDTH_PX = 384; // 24rem

export function SidebarProvider({
  children,
  defaultOpen = true,
  collapsible: initialCollapsible = "icon",
  initialSidebarWidth = `${DEFAULT_EXPANDED_WIDTH_REM}rem`,
}: SidebarProviderProps) {
  const isMobileView = useIsMobile() // Hook to detect mobile view
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)
  const [isResizing, setIsResizing] = useState(false);

  const [sidebarWidth, setSidebarWidthState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedWidth = localStorage.getItem("sidebarWidthPx");
      if (storedWidth) return parseInt(storedWidth, 10);
    }
    if (typeof window !== "undefined" && initialSidebarWidth.endsWith("rem")) {
      return parseFloat(initialSidebarWidth) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    return DEFAULT_EXPANDED_WIDTH_REM * 16; // Default expanded width in pixels
  });

  const setSidebarWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH_PX, Math.min(newWidth, MAX_SIDEBAR_WIDTH_PX));
    setSidebarWidthState(clampedWidth);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarWidthPx", clampedWidth.toString());
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

  // Effect to update CSS variable for sidebar width, driving the layout
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (state === 'expanded' && !isMobileView) {
        root.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
        root.style.setProperty('--current-sidebar-width', `${sidebarWidth}px`);
      } else if (state === 'collapsed' && !isMobileView) {
        root.style.setProperty('--sidebar-width', 'var(--sidebar-width-icon)'); // Use fixed collapsed width
        root.style.setProperty('--current-sidebar-width', 'var(--sidebar-width-icon)');
      } else { // Mobile / Offcanvas
        root.style.setProperty('--sidebar-width', `${DEFAULT_EXPANDED_WIDTH_REM * 16}px`); // For the sheet content
        root.style.setProperty('--current-sidebar-width', '0px'); // No margin for main content when mobile & closed
      }
    }
  }, [sidebarWidth, state, isMobileView]);


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
        isResizing,
        setIsResizing
      }}
    >
      <TooltipProvider delayDuration={0}>
        <div
          className="group/sidebar-wrapper flex h-full w-full"
          data-state={state}
        >
           {!isMobileView && collapsible !== "offcanvas" && (
             <div
                className={cn(
                  "hidden md:block flex-shrink-0",
                   isResizing ? "!transition-none" : "transition-all duration-200 ease-in-out",
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

// --- Sidebar Components ---

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
  const { isMobile, openMobile, setOpenMobile, state, collapsible: contextCollapsible, sidebarWidth, setSidebarWidth, setIsResizing, isResizing: contextIsResizing } = useSidebar()
  const effectiveCollapsible = collapsible || contextCollapsible;
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state !== 'expanded' || effectiveCollapsible === 'icon' || isMobile) return;
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [state, effectiveCollapsible, isMobile, setIsResizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!contextIsResizing || !sidebarRef.current) return;
      let newWidth = e.clientX;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (contextIsResizing) {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    if (contextIsResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
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
  }, [contextIsResizing, setSidebarWidth, setIsResizing]);


  if (isMobile) {
    return (
      <RadixSheetRoot open={openMobile} onOpenChange={setOpenMobile}>
        {/* SheetTrigger is now typically part of AppHeader, so not explicitly rendered here */}
        <RadixSheetContentOriginal side="left" className={cn("p-0 flex flex-col w-[var(--sidebar-width)] bg-sidebar text-sidebar-foreground border-sidebar-border", className)} {...props}>
          {/* RadixSheetTitleOriginal is now used by AppSidebarClient via export */}
          {children}
        </RadixSheetContentOriginal>
      </RadixSheetRoot>
    )
  }

  // Desktop Sidebar
  return (
    <aside
      ref={sidebarRef}
      className={cn(
        sidebarVariants({ variant, isResizing: contextIsResizing }),
        state === 'collapsed' ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]",
        className
      )}
      data-state={state}
      {...props}
    >
      {children}
      {state === 'expanded' && effectiveCollapsible !== 'offcanvas' && effectiveCollapsible !== 'icon' && !isMobile && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 right-0 h-full w-1.5 cursor-ew-resize group-hover/sidebar-wrapper:bg-primary/10 active:bg-primary/20",
            "transition-colors duration-150 ease-in-out",
             contextIsResizing && "bg-primary/20"
          )}
          title="Resize sidebar"
        >
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover/sidebar-wrapper:opacity-70 transition-opacity"/>
        </div>
      )}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { toggleSidebar, isMobile } = useSidebar()
    if (typeof isMobile !== 'boolean' || !isMobile ) {
         return <RadixSheetTriggerOriginal asChild><div /></RadixSheetTriggerOriginal>;
    }
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
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
 ({ className, children, ...props }, ref) => {
    const { isResizing } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
          "group-data-[state=collapsed]/sidebar:justify-center group-data-[state=expanded]/sidebar:justify-between",
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
        "group-data-[state=expanded]/sidebar:px-2",
        "group-data-[state=collapsed]/sidebar:px-1.5"
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
  tooltip?: React.ReactNode // Removed asChild from here for simplicity and directness
  level?: number
  hasSubItems?: boolean
  isOpen?: boolean
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    { className, icon: Icon, label, isActive, tooltip, level = 0, children, hasSubItems, isOpen, ...props },
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
         {hasSubItems && (!isCollapsed || isMobile) && (
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
          isCollapsed && "justify-center px-0",
          !isCollapsed && `pl-${2 + (level * 1.5 > 6 ? 6 : level * 1.5)}`,
          className
        )}
        {...props}
      >
        {content}
      </Button>
    );


    if (isCollapsed && tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref} // Ensure ref is passed if TooltipTrigger uses asChild
              variant={isActive ? "sidebarAccent" : "ghostSidebar"}
              className={cn("h-9 w-full justify-center", className)}
              {...props}
            >
              {Icon && <Icon className="size-5 shrink-0" />}
              <span className="sr-only">{tooltip}</span>
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
          "ml-0 space-y-0.5 group-data-[state=collapsed]/sidebar:hidden pl-[calc(var(--sidebar-indent-base)_/_2)] border-l border-sidebar-border/50 my-1",
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

// Re-export necessary components from sheet.tsx for AppSidebarClient
export { RadixSheetCloseOriginal as SheetClose };
export { RadixSheetTitleOriginal as SheetTitle };


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
    