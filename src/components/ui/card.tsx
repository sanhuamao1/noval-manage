import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, icon, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-bg-700 border border-border-subtle p-6",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: LucideIcon
    title: string
  }
>(({ className, icon, title, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 pb-4 mb-4 border-b border-border-subtle", className)}
    {...props}
  >
    {icon && <icon className="w-5 h-5 text-accent-500" />}
    <h3 className="text-base font-semibold">{title}</h3>
  </div>
))
CardHeader.displayName = "CardHeader"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardContent }