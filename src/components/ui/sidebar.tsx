"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon } from "lucide-react" 
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet as RadixSheet, SheetContent as RadixSheetContent, SheetTrigger as RadixSheetTrigger, SheetClose as RadixSheetClose, SheetTitle as RadixSheetTitle } from "@/components/ui/sheet"

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

const sidebarVariantsCva = cva(
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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariantsCva> {
 // collapsible prop removed as it's now primarily driven by context
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, variant, children, ...props }, ref) => {
  const { isMobile, openMobile, setOpenMobile, state, collapsible: contextCollapsible } = useSidebar()

  if (isMobile) {
    return (
      <RadixSheet open={openMobile} onOpenChange={setOpenMobile}>
        {/* The RadixSheetTrigger is typically placed in the AppHeader, not here. */}
        {/* This RadixSheet instance primarily provides RadixSheetContent for the mobile sidebar. */}
        <RadixSheetContent
          side="left"
          className={cn("p-0 flex flex-col w-[var(--sidebar-width)]", className)} 
          ref={ref as React.Ref<HTMLDivElement>} // RadixSheetContent renders a div
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus on open for mobile
          {...props}
        >
          {children} {/* AppSidebarClient will render SidebarHeader (with SheetTitle/Close) & SidebarContent */}
        </RadixSheetContent>
      </RadixSheet>
    )
  }

  return (
    <aside
      ref={ref}
      className={cn(sidebarVariantsCva({ variant, collapsibleType: contextCollapsible, className }))}
      data-state={state} 
      {...props}
    >
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"


export const SidebarTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar, isMobile } = useSidebar()
    if (!isMobile) return null 

    return (
      // This RadixSheetTrigger is the actual button that opens the mobile sidebar
      <RadixSheetTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={toggleSidebar} // This will be handled by RadixSheet's onOpenChange via context
          className={cn("md:hidden", className)} // Ensure it's hidden on desktop
          aria-label="Toggle sidebar"
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


const SidebarContent = forwardRef<
  React.ElementRef<typeof ScrollArea>, // Refers to ScrollArea now
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, children, ...props }, ref) => {
  // SidebarContent is now essentially a ScrollArea wrapper
  return (
    <ScrollArea ref={ref} className={cn("flex-1", className)} {...props}>
      {children} {/* Children passed to ScrollArea will be rendered inside its Viewport */}
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
    const { state: sidebarState, isMobile, collapsible: contextCollapsible } = useSidebar()
    const isCollapsed = !isMobile && sidebarState === "collapsed" && contextCollapsible !== "offcanvas";

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

    const Comp = asChild ? Slot : Button;

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
        {/* If asChild is true, Slot will handle children. If not, Button renders content. */}
        {children} 
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
    
    const [skeletonTextWidth, setSkeletonTextWidth] = useState('75%'); 

    useEffect(() => {
      setSkeletonTextWidth(`${Math.floor(Math.random() * (85 - 55 + 1)) + 55}%`);
    }, []);

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
  // Sheet components are now directly used from @/components/ui/sheet
  // or through RadixSheet, RadixSheetContent etc. aliased above for internal use.
  // Export SheetClose and SheetTitle for use in AppSidebarClient
  RadixSheetClose as SheetClose,
  RadixSheetTitle as SheetTitle,
}
