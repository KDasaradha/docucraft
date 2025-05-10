// src/components/ui/sidebar.tsx
"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, ChevronDown, ChevronRight, GripVertical } from "lucide-react" 
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
// Correctly import SheetTitle from ui/sheet and alias it for re-export
import { SheetTitle as RadixSheetTitleOriginal } from "@/components/ui/sheet";


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
  initialSidebarWidth?: string 
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
    if (typeof window !== "undefined" && initialSidebarWidth.endsWith("rem")) {
      return parseFloat(initialSidebarWidth) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    return DEFAULT_EXPANDED_WIDTH_REM * 16; 
  });

  const setSidebarWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH_PX, Math.min(newWidth, MAX_SIDEBAR_WIDTH_PX));
    setSidebarWidthState(clampedWidth);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarWidth", clampedWidth.toString());
      document.documentElement.style.setProperty('--sidebar-width', `${clampedWidth}px`);
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
      } else { 
        // Default for mobile or offcanvas, could be initial width or a fixed mobile width
        root.style.setProperty('--sidebar-width', `${DEFAULT_EXPANDED_WIDTH_REM * 16}px`); 
      }
    }
  }, [sidebarWidth, state, isMobileView]);
  
  // This effect sets the --current-sidebar-width for main content margin adjustment
  useEffect(() => {
    const root = document.documentElement;
    let currentAppliedWidthValue = `${DEFAULT_EXPANDED_WIDTH_REM * 16}px`; // Default for mobile sheet

    if (!isMobileView) {
      if (state === 'collapsed') {
        currentAppliedWidthValue = 'var(--sidebar-width-icon)';
      } else {
        currentAppliedWidthValue = `${sidebarWidth}px`;
      }
    }
    // For mobile, when the sheet is closed, the effective width for margin should be 0.
    // This is handled by the main content not having a margin when sidebar is mobile and closed.
    // The --current-sidebar-width is primarily for desktop layout.
    root.style.setProperty('--current-sidebar-width', currentAppliedWidthValue);
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
                  "hidden md:block flex-shrink-0 transition-all duration-200 ease-in-out",
                   isResizing ? "!transition-none" : "", 
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


const RadixSheet = DialogPrimitive.Root
const RadixSheetTrigger = DialogPrimitive.Trigger
const RadixSheetClose = DialogPrimitive.Close 
const RadixSheetPortal = DialogPrimitive.Portal

const RadixSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", 
      className
    )}
    {...props}
    ref={ref}
  />
))
RadixSheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const radixSheetVariants = cva(
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

interface RadixSheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof radixSheetVariants> {}

const RadixSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  RadixSheetContentProps
>(({ side = "left", className, children, ...props }, ref) => (
  <RadixSheetPortal>
    <RadixSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(radixSheetVariants({ side }), className)}
      onOpenAutoFocus={(e) => e.preventDefault()} 
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </RadixSheetPortal>
))
RadixSheetContent.displayName = DialogPrimitive.Content.displayName


const sidebarVariants = cva(
  "flex flex-col transition-width duration-200 ease-in-out group fixed top-[var(--header-height)] bottom-0 left-0 z-30", 
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
  const { isMobile, openMobile, setOpenMobile, state, collapsible: contextCollapsible, sidebarWidth, setSidebarWidth, setIsResizing, isResizing } = useSidebar()
  const effectiveCollapsible = collapsible || contextCollapsible;
  const sidebarRef = useRef<HTMLDivElement>(null);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state !== 'expanded' || effectiveCollapsible === 'icon') return; 
    e.preventDefault();
    setIsResizing(true); 
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [state, effectiveCollapsible, setIsResizing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return; 
      let newWidth = e.clientX; 
      setSidebarWidth(newWidth);
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
      if (document.body.style.cursor === 'ew-resize') { 
        document.body.style.cursor = 'default';
      }
      if (document.body.style.userSelect === 'none') { 
         document.body.style.userSelect = 'auto';
      }
    };
  }, [isResizing, setSidebarWidth, setIsResizing]); 


  if (isMobile) {
    return (
      <RadixSheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className={cn("p-0 flex flex-col", className, isResizing && "!cursor-ew-resize")} {...props}>
           <RadixSheetTitleOriginal className="sr-only">Main Menu</RadixSheetTitleOriginal>
          {children}
        </SheetContent>
      </RadixSheet>
    )
  }

  return (
    <aside
      ref={sidebarRef} 
      className={cn(sidebarVariants({ variant, isResizing }), 
        state === 'collapsed' ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]",
        className
      )}
      data-state={state} 
      {...props}
    >
      {children}
      {state === 'expanded' && effectiveCollapsible !== 'offcanvas' && effectiveCollapsible !== 'icon' && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 right-0 h-full w-1.5 cursor-ew-resize group-hover:bg-primary/10 active:bg-primary/20",
            "transition-colors duration-150 ease-in-out",
             isResizing && "bg-primary/20" 
          )}
          title="Resize sidebar"
        >
            <GripVertical className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-70 transition-opacity"/>
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
         return <Button ref={ref} variant="ghost" size="icon" className="opacity-0 pointer-events-none md:hidden" aria-hidden="true" {...props}><Menu /></Button>;
    }
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
    const { isMobile, isResizing } = useSidebar();
    const Comp = isMobile ? DialogPrimitive.Title : "div"; 
    return (
      <Comp
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
      </Comp>
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
         {hasSubItems && (!isCollapsed || isMobile) && ( 
           isOpen ? <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        )}
      </>
    )

    const button = (
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
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); 

    const showIcon = propShowIcon === undefined ? true : propShowIcon;
    let showTextVal = propShowText === undefined ? !isCollapsed : propShowText; 
    if (isMobile) showTextVal = true; 


    useEffect(() => {
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
        {showTextVal && ( 
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


export { RadixSheet, RadixSheetTrigger, RadixSheetContent, RadixSheetHeader, RadixSheetTitleOriginal, RadixSheetClose };

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
  SheetClose, 
}

    
