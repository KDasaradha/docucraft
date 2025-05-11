import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md", // Added hover:shadow-md
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md", // Added hover:shadow-md
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm", // Added hover:shadow-sm
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm", // Added hover:shadow-sm
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sidebar: "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", 
        sidebarAccent: "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90", 
        ghostSidebar: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", 
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button;

    const motionProps = asChild ? {} : {
      whileHover: { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } },
      whileTap: { scale: 0.97 },
      // Removed initial/animate for individual buttons to avoid FOUC on page load
      // Initial animations better handled by parent components if needed
    };
    
    if (asChild) {
      // For 'asChild' props, we pass the styling class to the Slot component.
      // The Slot component then clones its child, merging these props.
      // Framer Motion props are not directly applicable to Slot itself, but to its child if it's a motion component.
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }