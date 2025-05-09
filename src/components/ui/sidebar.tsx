"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
// Slot is not directly used in this file's exports after Button logic moved to Button component
// import { Slot } from "@radix-ui/react-slot"; 
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
// Import the actual Radix UI components from ui/sheet.tsx to avoid re-implementing them here
import {
  Sheet as RadixSheet,
  SheetTrigger as RadixSheetTrigger, // This is DialogPrimitive.Trigger
  SheetClose,
  SheetContent as RadixSheetContent, // This is DialogPrimitive.Content wrapped with portal & overlay
  SheetHeader as RadixSheetHeader, // This is a div with styling
  SheetTitle as RadixSheetTitle,   // This is DialogPrimitive.Title
  SheetDescription as RadixSheetDescription, // This is DialogPrimitive.Description
  SheetFooter as RadixSheetFooter    // This is a div with styling
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
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  collapsible: initialCollapsible = "icon",
}: SidebarProviderProps) {
  const isMobileView = useIsMobile() // This hook handles client-side check
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)

  const collapsible = isMobileView ? "offcanvas" : initialCollapsible

  const state = useMemo<SidebarState>(() => {
    if (isMobileView) return "offcanvas" // On mobile, it's always conceptually "offcanvas"
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
    // If view changes from mobile to desktop and mobile sidebar was open, close it.
    if (!isMobileView && openMobile) {
      setOpenMobile(false)
    }
  }, [isMobileView, openMobile])

  const contextValue = {
    collapsible,
    state,
    isMobile: isMobileView, // Pass the resolved mobile state
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  const sidebarWidthVar = state === 'collapsed' && !isMobileView && collapsible !== 'offcanvas'
    ? 'var(--sidebar-width-icon)'
    : 'var(--sidebar-width)'
  const currentSidebarWidthVar = openMobile && isMobileView ? 'var(--sidebar-width)' : sidebarWidthVar;

  const providerContent = (
    <TooltipProvider delayDuration={0}>
      <div
        className="group/sidebar-wrapper flex h-full w-full"
        data-state={state}
        style={{ ['--current-sidebar-width' as string]: currentSidebarWidthVar }}
      >
        {/* Desktop placeholder for fixed sidebar width */}
        {!isMobileView && collapsible !== "offcanvas" && (
          <div
            className={cn(
              "hidden md:block flex-shrink-0 transition-all duration-200 ease-in-out",
              state === 'collapsed' ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </TooltipProvider>
  );

  if (isMobileView === undefined) {
    // Prevent rendering on server or during first client render before useIsMobile resolves
    // This helps avoid hydration mismatches related to mobile-specific layout.
    // Render children directly or a minimal placeholder if necessary.
    // For now, let's provide the context but potentially delay RadixSheet rendering.
    return (
        <SidebarContext.Provider value={{ ...contextValue, isMobile: false /* sensible default for SSR */ }}>
            {providerContent}
        </SidebarContext.Provider>
    );
  }
  

  if (isMobileView) {
    return (
      <SidebarContext.Provider value={contextValue}>
        <RadixSheet open={openMobile} onOpenChange={setOpenMobile}>
          {/* The SidebarTrigger will be part of these children (via AppHeader) */}
          {/* The SheetContent will also be part of these children (via AppSidebarClient rendering it) */}
          {providerContent}
        </RadixSheet>
      </SidebarContext.Provider>
    );
  }

  // Desktop view
  return (
    <SidebarContext.Provider value={contextValue}>
      {providerContent}
    </SidebarContext.Provider>
  );
}


// SidebarTrigger uses RadixSheetTrigger from ui/sheet.tsx
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { toggleSidebar, isMobile } = useSidebar();
    
    // Ensure isMobile is defined and true before rendering
    if (typeof isMobile !== 'boolean' || !isMobile) {
      return null;
    }

    return (
      <RadixSheetTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="md:hidden" // Ensure it's only for mobile-like views
          {...props}
        >
          <Menu />
        </Button>
      </RadixSheetTrigger>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";


const sidebarVariantsCva = cva(
  "flex flex-col transition-all duration-200 ease-in-out group fixed top-[var(--header-height)] bottom-0 left-0 z-40",
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md",
      },
      collapsibleType: {
        icon: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width)]",
        button: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width)]",
        offcanvas: "w-[var(--sidebar-width)]", // Should not apply to fixed desktop sidebar
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sidebarVariantsCva> {}


// Sidebar component is now primarily for desktop view (<aside>)
// For mobile, AppSidebarClient will use RadixSheetContent directly.
const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className, variant, children, ...props }, ref) => {
    const { state, collapsible: contextCollapsible, isMobile } = useSidebar();

    if (isMobile) {
      // On mobile, this component's content is rendered inside RadixSheetContent by AppSidebarClient.
      // So, this Sidebar component shouldn't render <aside> or SheetContent itself.
      // It should just provide its children to AppSidebarClient.
      // For this direct usage, we assume it's NOT mobile or AppSidebarClient handles it.
      // If AppSidebarClient renders <Sidebar> on mobile, that needs to be changed.
      // Let's assume AppSidebarClient uses RadixSheetContent directly on mobile.
      // Thus, if <Sidebar> is used, it's for desktop.
      return null; // Or handle differently if <Sidebar> can be used on mobile as content wrapper
    }

    // Desktop view:
    return (
      <aside
        ref={ref}
        className={cn(sidebarVariantsCva({ variant, collapsibleType: contextCollapsible, className }))}
        data-state={state}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";


const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile } = useSidebar();
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3 justify-between",
          "group-data-[state=collapsed]/sidebar:justify-center group-data-[state=expanded]/sidebar:justify-between",
          className
        )}
        {...props}
      >
        {isMobile && <RadixSheetTitle className="sr-only">Main Menu</RadixSheetTitle>}
        {children}
        {isMobile && (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close menu</span>
            </Button>
          </SheetClose>
        )}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";


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
SidebarFooter.displayName = "SidebarFooter";


const SidebarMenu = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("space-y-0.5 py-2", className)}
      {...props}
    />
  )
)
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps extends ButtonProps {
  icon?: LucideIcon
  label?: string
  isActive?: boolean
  asChild?: boolean
  tooltip?: React.ReactNode
  level?: number
  hasSubItems?: boolean // Added to manage chevron display
  isOpen?: boolean      // Added to manage chevron state
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    { className, icon: Icon, label, isActive, asChild, tooltip, level = 0, children, hasSubItems, isOpen, ...props },
    ref
  ) => {
    const { state: sidebarState, isMobile, collapsible: contextCollapsible } = useSidebar();
    const isCollapsed = !isMobile && sidebarState === "collapsed" && contextCollapsible !== "offcanvas";

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
        {hasSubItems && !isCollapsed && !isMobile && ( // Don't show chevron on mobile if handled by native sheet closing
           isOpen ? <ChevronDown className="ml-auto h-4 w-4 shrink-0" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
        )}
         {hasSubItems && isMobile && ( // For mobile, chevron can be useful if submenus are part of the sheet content
           isOpen ? <ChevronDown className="ml-auto h-4 w-4 shrink-0" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
        )}
      </>
    );

    const buttonElement = (
      <Button
        ref={ref}
        variant={isActive ? "sidebarAccent" : "ghostSidebar"}
        className={cn(
          "h-auto min-h-[2.25rem] w-full justify-start items-center gap-2.5 text-sm px-3 py-2",
          isCollapsed && "justify-center px-0",
          `pl-${isCollapsed ? 3 : (3 + (level * 1.5))}`,
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
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={10}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )
    }
    return buttonElement;
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton";


const SidebarMenuSub = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

    if (isCollapsed && !isMobile) return null; // Hide sub-menu when collapsed on desktop

    return (
      <ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 group-data-[state=collapsed]/sidebar:hidden pl-3 border-l border-sidebar-border/50 my-1",
          isMobile && "pl-3 border-l border-sidebar-border/50 my-1", // Ensure styling on mobile too
          className
        )}
        {...props}
      />
    );
  }
);
SidebarMenuSub.displayName = "SidebarMenuSub";


const SidebarMenuSkeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean, showText?: boolean }>(
  ({ className, showIcon = true, showText = true, ...props }, ref) => {
    const { state: sidebarStateHook, isMobile: isMobileHook, collapsible: collapsibleHook } = useSidebar();
    const isCollapsed = !isMobileHook && sidebarStateHook === "collapsed" && collapsibleHook !== "offcanvas";
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%');

    useEffect(() => {
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []);

    const actualShowIcon = showIcon;
    const actualShowText = showText && !isCollapsed;

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
        {actualShowIcon && (
           <Skeleton
            className={cn("rounded-md bg-sidebar-foreground/10", isCollapsed ? "size-5" : "size-4")}
            data-sidebar="menu-skeleton-icon"
          />
        )}
        {actualShowText && (
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
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";


export {
  Sidebar, // This is the <aside> for desktop
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSkeleton,
  // Radix specific sheet components are used internally by SidebarProvider or AppSidebarClient
  // Re-exporting them if they are needed externally from here
  RadixSheetTitle, 
  SheetClose, 
}
