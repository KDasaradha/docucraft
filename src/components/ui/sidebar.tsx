// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon } from "lucide-react" 
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetTitle as RadixSheetTitle, SheetContent as RadixSheetContent, SheetHeader as RadixSheetHeader, SheetFooter as RadixSheetFooter, SheetDescription as RadixSheetDescription, SheetOverlay as RadixSheetOverlay, SheetPortal as RadixSheetPortal, SheetClose as RadixSheetClose, SheetTrigger as RadixSheetTrigger, Sheet as RadixSheet } from "@/components/ui/sheet";


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
  const isMobileView = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(!defaultOpen)

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

  const sidebarWidthVar = state === 'collapsed' && !isMobileView && collapsible !== 'offcanvas'
    ? 'var(--sidebar-width-icon)'
    : 'var(--sidebar-width)'
  const currentSidebarWidthVar = openMobile && isMobileView ? 'var(--sidebar-width)' : sidebarWidthVar;


  return (
    <SidebarContext.Provider
      value={{
        collapsible,
        state,
        isMobile: isMobileView,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      <TooltipProvider delayDuration={0}>
        <div 
          className="group/sidebar-wrapper flex h-full w-full" 
          data-state={state}
          style={{
            ['--current-sidebar-width' as string]: currentSidebarWidthVar,
          }}
        >
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
    </SidebarContext.Provider>
  )
}

const Sheet = RadixSheet;
const SheetTrigger = RadixSheetTrigger;
const SheetClose = RadixSheetClose;
const SheetPortal = RadixSheetPortal;
const SheetOverlay = RadixSheetOverlay;
const SheetContent = RadixSheetContent;
const SheetHeader = RadixSheetHeader;
const SheetFooter = RadixSheetFooter;
export const SheetTitle = RadixSheetTitle;
const SheetDescription = RadixSheetDescription;


const sidebarVariants = cva(
  "flex flex-col transition-all duration-200 ease-in-out group",
  {
    variants: {
      variant: {
        default: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        sidebar: "bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-md",
      },
      collapsibleType: {
        icon: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width)]",
        button: "data-[state=collapsed]:w-[var(--sidebar-width-icon)] data-[state=expanded]:w-[var(--sidebar-width)]",
        offcanvas: "w-[var(--sidebar-width)]", 
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  collapsible?: CollapsibleType 
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, collapsible, children, ...props }, ref) => {
  const { isMobile, openMobile, setOpenMobile, state, collapsible: contextCollapsible } = useSidebar()
  const effectiveCollapsible = collapsible || contextCollapsible;


  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          {/* The actual trigger button is usually in AppHeader, this div is a placeholder if needed */}
          <div /> 
        </SheetTrigger>
        <SheetContent side="left" className={cn("p-0 flex flex-col", className)} {...props}>
            {/* SheetTitle should be included here by the consumer (AppSidebarClient) if needed for accessibility */}
            {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      ref={ref}
      className={cn(sidebarVariants({ variant, collapsibleType: effectiveCollapsible, className }))}
      data-state={state} 
      {...props}
    >
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { toggleSidebar, isMobile } = useSidebar()
    if (!isMobile) return null 

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        {...props}
      >
        <Menu />
      </Button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-[var(--header-height)] items-center border-b border-sidebar-border p-3",
        "group-data-[state=collapsed]/sidebar:justify-center", 
        className
      )}
      {...props}
    />
  )
)
SidebarHeader.displayName = "SidebarHeader"


const SidebarContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <ScrollArea ref={ref} className={cn("flex-1", className)} {...props}>
       {children}
      </ScrollArea>
    );
  }
);
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
      className={cn("space-y-0.5 py-2 px-2", className)}
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
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    { className, icon: Icon, label, isActive, asChild, tooltip, level = 0, children, ...props },
    ref
  ) => {
    const { state: sidebarState, isMobile, collapsible } = useSidebar()
    const isCollapsed = !isMobile && sidebarState === "collapsed" && collapsible !== "offcanvas";

    const content = (
      <>
        {Icon && <Icon className={cn("shrink-0", isCollapsed ? "size-5" : "size-4")} />}
        <span
          className={cn(
            "truncate flex-grow",
            isCollapsed && "hidden", 
          )}
        >
          {children || label}
        </span>
      </>
    )

    const Comp = asChild ? Slot : Button; // Use Slot if asChild is true

    const buttonElement = (
      <Comp
        ref={ref}
        variant={isActive ? "sidebarAccent" : "ghostSidebar"}
        className={cn(
          "h-9 w-full justify-start gap-2.5",
          isCollapsed && "justify-center", 
          `pl-${2 + (level * 2)}`, // Dynamic padding based on level
          className
        )}
        {...props} // Spread props here for both Button and Slot
      >
        {asChild ? children : content}
      </Comp>
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
SidebarMenuButton.displayName = "SidebarMenuButton"


const SidebarMenuSub = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";

    if (isCollapsed) return null; 

    return (
      <ul
        ref={ref}
        className={cn(
          "ml-0 space-y-0.5 group-data-[state=collapsed]/sidebar:hidden", 
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
    const { state, isMobile, collapsible } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed" && collapsible !== "offcanvas";

    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); // Consistent default
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      // Set random width only on the client after mount
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []); // Empty dependency array ensures this runs once on mount on the client

    // Determine if text should be shown based on collapsed state and showText prop
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
        {/* Icon skeleton visibility logic */}
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

        {/* Text skeleton: Render consistently on server, then update width on client */}
        {actualShowText && (
          <Skeleton
            className="h-4 flex-1 max-w-[var(--skeleton-width)] rounded-sm bg-sidebar-foreground/10"
            data-sidebar="menu-skeleton-text"
            // Use isMounted to apply random width only on client after hydration
            style={{ ['--skeleton-width' as string]: isMounted ? skeletonTextWidth : '75%' } as React.CSSProperties}
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
  // Sheet specific exports are already available from RadixSheet imports at the top of the file
  // if direct usage is needed elsewhere, but Sidebar component handles mobile offcanvas internally.
}
