import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border shadow-sm hover:shadow-md transition-shadow", 
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive shadow-md shadow-destructive/30 hover:shadow-lg transition-shadow", 
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    {...props}
  >
    <div className="flex items-start"> {/* Wrapper to align icon and text content */}
      {React.Children.toArray(children).find(child => React.isValidElement(child) && typeof child.type !== 'string' && (child.type as any).displayName !== 'AlertTitle' && (child.type as any).displayName !== 'AlertDescription')}
      <div className="ml-4 flex-1"> {/* Margin for icon spacing if an icon is the first child */}
        {React.Children.toArray(children).filter(child => !(React.isValidElement(child) && typeof child.type !== 'string' && (child.type as any).displayName !== 'AlertTitle' && (child.type as any).displayName !== 'AlertDescription'))}
      </div>
    </div>
  </motion.div>
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight text-lg", className)} // Increased font-weight and size
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }