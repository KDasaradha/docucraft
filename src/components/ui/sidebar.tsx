// src/components/ui/sidebar.tsx

"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback, forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Menu, type LucideIcon, ChevronDown, ChevronRight } from "lucide-react" 
import { cn } from "@/lib/utils"
// import { Slot } from "@radix-ui/react-slot" // No longer directly used in this file's exports for Button logic
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetTitle as RadixSheetTitleOriginal, SheetClose as RadixSheetCloseOriginal } from "@/components/ui/sheet"; 


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

// Re-exporting Radix Sheet components for internal use or if needed by consumers
const Sheet = DialogPrimitive.Root
const SheetTriggerFromPrimitive = DialogPrimitive.Trigger 
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
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
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const sheetVariantsForSidebar = cva(
  "fixed z-50 gap-4 bg-sidebar text-sidebar-foreground shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-full w-[var(--sidebar-width)] border-r border-sidebar-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
)

interface SheetContentForSidebarProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof sheetVariantsForSidebar> {}

const SheetContentForSidebar = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentForSidebarProps
>(({ side = "left", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariantsForSidebar({ side }), className)}
      onOpenAutoFocus={(e) => e.preventDefault()} 
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContentForSidebar.displayName = DialogPrimitive.Content.displayName


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
    if (!isMobileView && openMobile) { 
      setOpenMobile(false) 
    }
  }, [isMobileView, openMobile])

  const sidebarWidthVar = state === 'collapsed' && !isMobileView && collapsible !== 'offcanvas'
    ? 'var(--sidebar-width-icon)'
    : 'var(--sidebar-width)'
  const currentSidebarWidthVar = openMobile && isMobileView ? 'var(--sidebar-width)' : sidebarWidthVar;

  const contextValue = { collapsible, state, isMobile: isMobileView, openMobile, setOpenMobile, toggleSidebar };

  const providerContent = (
    <TooltipProvider delayDuration={0}>
      <div 
        className="group/sidebar-wrapper flex h-full w-full" 
        data-state={state}
        style={{ ['--current-sidebar-width' as string]: currentSidebarWidthVar }}
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
  );

  if (isMobileView) {
    return (
      <SidebarContext.Provider value={contextValue}>
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          {providerContent}
        </Sheet>
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      {providerContent}
    </SidebarContext.Provider>
  );
}


const sidebarVariantsCva = cva(
  "flex flex-col transition-all duration-200 ease-in-out group fixed top-[var(--header-height)] bottom-0 left-0 z-30", 
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

interface SidebarProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sidebarVariantsCva> {}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className, variant, children, ...props }, ref) => {
  const { isMobile, state, collapsible: contextCollapsible } = useSidebar()

  if (isMobile) {
    return (
      <SheetContentForSidebar 
        side="left" 
        className={cn("p-0 flex flex-col", className)} 
        ref={ref as React.Ref<HTMLDivElement>} 
        {...props}
      >
        {children}
      </SheetContentForSidebar>
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
  (props, ref) => {
    const { isMobile } = useSidebar();
    if (!isMobile) return null;

    return (
      <SheetTriggerFromPrimitive asChild ref={ref} {...props}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle sidebar"
          className="md:hidden" 
        >
          <Menu />
        </Button>
      </SheetTriggerFromPrimitive>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger"

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
SidebarHeader.displayName = "SidebarHeader"


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
SidebarFooter.displayName = "SidebarFooter"


const SidebarMenu = forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("space-y-0.5 py-2", className)} 
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
    const { state: sidebarState, isMobile, collapsible: contextCollapsible } = useSidebar()
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
        {hasSubItems && !isCollapsed && (
           isOpen ? <ChevronDown className="ml-auto h-4 w-4 shrink-0" /> : <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
        )}
      </>
    )

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
          "ml-0 space-y-0.5 group-data-[state=collapsed]/sidebar:hidden pl-3 border-l border-sidebar-border/50 my-1", 
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
      // This will only run on the client, after initial hydration
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
  RadixSheetTitleOriginal as SheetTitle, 
  RadixSheetCloseOriginal as SheetCloseExplicit, 
}
