"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, X } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input" // Not used directly in this file
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet" // Ensure SheetClose is imported
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// ScrollArea import is not directly used in this file but kept for potential future use or if a child component expects it via context.
// If SidebarContent itself becomes scrollable internally, it would use its own ScrollArea.
// import { ScrollArea } from "@/components/ui/scroll-area"


const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // 256px
const SIDEBAR_WIDTH_MOBILE = "18rem" // 288px
const SIDEBAR_WIDTH_ICON = "3.5rem" // 56px (increased for better touch target and visual balance)
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextType = { // Renamed to avoid conflict with React.Context
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (typeof document !== 'undefined') {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((openMobileState) => !openMobileState) // Use functional update
        : setOpen((openState) => !openState) // Use functional update
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      if (typeof window !== 'undefined') {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
      }
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextType>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                "--header-height": "var(--header-height, 4rem)", // Ensure header-height is available
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-screen w-full has-[[data-variant=inset]]:bg-sidebar", // changed min-h-svh to min-h-screen
              className
            )}
            ref={ref}
            {...props}
          >
            {/* This div acts as a placeholder for the fixed sidebar, preventing content overlap */}
             {/* Render placeholder only on desktop and when sidebar is not off-canvas */}
             {!isMobile && collapsible !== "offcanvas" && (
               <div
                  className={cn(
                    "hidden md:block flex-shrink-0 transition-all duration-200 ease-in-out",
                    state === "expanded" ? "w-[var(--sidebar-width)]" : "w-[var(--sidebar-width-icon)]"
                  )}
                />
             )}
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const sidebarVariants = cva(
  "bg-sidebar text-sidebar-foreground transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        sidebar: "shadow-sm",
        floating: "m-2.5 rounded-lg border shadow-lg",
        inset: "m-2.5 rounded-lg border shadow-lg",
      },
      collapsible: {
        offcanvas: "max-md:hidden", // Handled by Sheet for mobile
        icon: "md:w-[var(--sidebar-width-icon)]",
        none: "md:w-[var(--sidebar-width)]",
      },
      state: { // For explicit state control if needed, though context is primary
        expanded: "md:w-[var(--sidebar-width)]",
        collapsed: "md:w-[var(--sidebar-width-icon)]",
      },
      side: { // Not directly used by this component but for consistency
        left: "",
        right: "",
      }
    },
    defaultVariants: {
      variant: "sidebar",
      collapsible: "icon",
      state: "expanded",
    },
  }
)

interface SidebarProps extends React.ComponentProps<"aside">, VariantProps<typeof sidebarVariants> {
  side?: "left" | "right"
  // variant already in VariantProps
  // collapsible already in VariantProps
}


const Sidebar = React.forwardRef<
  HTMLElement, // Changed from HTMLDivElement to HTMLElement for semantic <aside>
  SidebarProps
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon", // Default to icon for desktop
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state: sidebarState, openMobile, setOpenMobile } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} modal={true}>
          <SheetContent
            side={side}
            className={cn(
              "w-[var(--sidebar-width-mobile)] bg-sidebar text-sidebar-foreground p-0 flex flex-col", 
              className // Allow external classes
            )}
            // No props passed to SheetContent other than className, side
          >
            {/* Children (Header, Content, Footer) are passed here by AppSidebarClient */}
            {children} 
          </SheetContent>
        </Sheet>
      )
    }
    
    // Desktop sidebar (fixed or icon-only)
    return (
      <aside
        ref={ref}
        data-testid="desktop-sidebar"
        className={cn(
          "group fixed top-[var(--header-height)] bottom-0 z-40 hidden h-[calc(100vh-var(--header-height))] flex-col md:flex",
          side === "left" ? "left-0 border-r border-sidebar-border" : "right-0 border-l border-sidebar-border",
          sidebarVariants({ variant, state: sidebarState, className }) // Use sidebarState for desktop
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 text-sidebar-foreground/80 hover:text-sidebar-foreground md:hidden", // Only show on mobile by default (md:hidden)
        className
      )}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="h-5 w-5"/>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar, state, isMobile } = useSidebar()

  if(isMobile) return null; // Rail is only for desktop

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={ref}
          data-sidebar="rail"
          aria-label="Toggle Sidebar"
          tabIndex={-1}
          onClick={toggleSidebar}
          className={cn(
            "absolute inset-y-0 z-20 hidden w-3 -translate-x-1/2 items-center justify-center transition-all ease-linear group-data-[side=left]:-right-1.5 group-data-[side=right]:-left-1.5 md:flex",
            "hover:bg-sidebar-accent/30 rounded-full",
            state === "expanded" && "group-data-[side=left]:right-[calc(var(--sidebar-width)-0.375rem)]",
            state === "expanded" && "group-data-[side=right]:left-[calc(var(--sidebar-width)-0.375rem)]",
            className
          )}
          {...props}
        >
          <div className="h-8 w-1 bg-sidebar-border group-hover:bg-sidebar-primary rounded-full transition-colors"/>
        </button>
      </TooltipTrigger>
      <TooltipContent side={props.dir === 'rtl' ? 'left' : 'right'} className="bg-background text-foreground border shadow-md">
          <p>{state === 'expanded' ? 'Collapse' : 'Expand'} sidebar (Cmd+B)</p>
      </TooltipContent>
    </Tooltip>
  )
})
SidebarRail.displayName = "SidebarRail"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col", className)} 
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-3 border-t border-sidebar-border mt-auto", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-3 my-1 w-auto bg-sidebar-border/70", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const { state: sidebarState, isMobile } = useSidebar();
  return (
    <Comp
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-y-1 overflow-y-auto overflow-x-hidden", 
        (sidebarState === 'collapsed' && !isMobile) && "overflow-hidden", // Hide overflow when icon-only on desktop
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col", className)} 
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  const { state: sidebarState, isMobile } = useSidebar();


  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "duration-200 flex h-8 shrink-0 items-center rounded-md px-3 text-xs font-semibold text-sidebar-foreground/60 outline-none ring-sidebar-ring transition-[margin,opacity] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 tracking-wider uppercase",
        (sidebarState === 'collapsed' && !isMobile) && "hidden", 
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state: sidebarState, isMobile } = useSidebar();

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        (sidebarState === 'collapsed' && !isMobile) && "hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
})
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} 
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group flex w-full items-center gap-x-3 overflow-hidden rounded-md text-left text-sm outline-none ring-sidebar-ring transition-colors focus-visible:ring-2 active:opacity-80 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
      size: {
        default: "h-9 px-3 py-2", 
        sm: "h-8 px-2.5 py-1.5 text-xs",
        lg: "h-10 px-3 py-2.5",
      },
      isActive: { 
        true: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-medium", // Updated active styles
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isActive: false,
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children, // Added children prop explicitly
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state: sidebarState } = useSidebar()

    const buttonContent = (
      <>
        {/* If there's an icon as first child, style it */}
        {React.Children.map(children, (child, index) => {
          if (index === 0 && React.isValidElement(child) && (child.type as any).displayName?.includes("Icon")) { // Basic icon check
            return React.cloneElement(child as React.ReactElement<any>, { 
              className: cn("shrink-0", (child.props as any).className) 
            });
          }
          return child;
        })}
      </>
    );


    const buttonClasses = cn(
      sidebarMenuButtonVariants({ variant, size, isActive }),
      (sidebarState === "collapsed" && !isMobile) && "!size-9 !p-0 justify-center", // Icon-only collapsed state
      className
    );
    
    const buttonElement = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive ? "true" : undefined} 
        className={buttonClasses}
        {...props}
      >
         {(sidebarState === "collapsed" && !isMobile) ? (
          React.Children.toArray(children)[0] // Render only the first child (icon) when collapsed
        ) : (
          buttonContent // Render all children when expanded or mobile
        )}
      </Comp>
    )

    if (!tooltip || (sidebarState === "expanded" && !isMobile)) { 
      return buttonElement
    }
    
    const tooltipContentProps = typeof tooltip === "string" ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          alignOffset={6} 
          className="bg-sidebar text-sidebar-foreground border-sidebar-border shadow-md"
          {...tooltipContentProps}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state: sidebarState, isMobile } = useSidebar();

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1/2", 
        "peer-data-[size=default]/menu-button:top-1/2",
        "peer-data-[size=lg]/menu-button:top-1/2",
        (sidebarState === 'collapsed' && !isMobile) && "hidden",
        showOnHover &&
          "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"
  const { state: sidebarState, isMobile } = useSidebar();
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-medium tabular-nums text-sidebar-foreground/90 select-none pointer-events-none bg-sidebar-accent/50", 
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:bg-sidebar-primary peer-data-[active=true]/menu-button:text-sidebar-primary-foreground",
        "peer-data-[size=sm]/menu-button:top-1/2",
        "peer-data-[size=default]/menu-button:top-1/2",
        "peer-data-[size=lg]/menu-button:top-1/2",
        (sidebarState === 'collapsed' && !isMobile) && "hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuBadge.displayName = "SidebarMenuBadge"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  const [skeletonWidth, setSkeletonWidth] = React.useState<string | null>(null);
  const { isMobile, state: sidebarStateHook } = useSidebar(); // Renamed to avoid conflict

  React.useEffect(() => {
    setSkeletonWidth(`${Math.floor(Math.random() * 40) + 50}%`);
  }, []);

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("rounded-md h-9 flex gap-x-3 px-3 py-2 items-center", className)} 
      {...props}
    >
      {showIcon && !isMobile && sidebarStateHook !== 'expanded' && ( 
         <Skeleton
          className="size-5 rounded-md bg-sidebar-foreground/10" 
          data-sidebar="menu-skeleton-icon"
        />
      )}
       {(sidebarStateHook === 'expanded' || isMobile) && skeletonWidth !== null && (
        <Skeleton
          className="h-4 flex-1 max-w-[var(--skeleton-width)] bg-sidebar-foreground/10"
          data-sidebar="menu-skeleton-text"
          style={
            {
              "--skeleton-width": skeletonWidth,
            } as React.CSSProperties
          }
        />
      )}
      {(sidebarStateHook === 'expanded' || isMobile) && skeletonWidth === null && (
         <Skeleton className="h-4 flex-1 max-w-[70%] bg-sidebar-foreground/10" data-sidebar="menu-skeleton-text-placeholder" />
      )}
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const { state: sidebarState, isMobile } = useSidebar();
  return (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "ml-5 flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border pl-3 pr-1 py-1", 
        (sidebarState === 'collapsed' && !isMobile) && "ml-0 hidden border-l-0 pl-0", 
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSub.displayName = "SidebarMenuSub"


const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li"> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "li"
  return(
    <Comp 
      ref={ref} 
      className={cn("group/submenu-item", className)} 
      {...props} 
    />
  )
})
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"


const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement, 
  React.ComponentProps<"a"> & { 
    asChild?: boolean
    size?: "sm" | "default" 
    isActive?: boolean
  }
>(({ asChild = false, size = "default", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a" 
  const { state: sidebarState, isMobile } = useSidebar();

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive ? "true" : undefined}
      className={cn(
        "flex min-w-0 items-center gap-x-2.5 overflow-hidden rounded-md px-2.5 text-sidebar-foreground/90 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:opacity-80 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium",
        size === "sm" && "h-7 text-xs py-1.5", 
        size === "default" && "h-8 text-sm py-2", 
        (sidebarState === 'collapsed' && !isMobile) && "hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarHeader,
  // SidebarInput, 
  // SidebarInset, 
  SidebarMenu,
  SidebarMenuAction, 
  SidebarMenuBadge, 
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  SheetTitle,
  SheetClose, // Export SheetClose for use in mobile sidebar header
}
