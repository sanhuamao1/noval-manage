import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Trash2 } from "lucide-react"
import { Button } from "./button"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, icon, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-bg-700 border border-border-subtle p-5",
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
    rightHandler?: React.ReactNode
  }
>(({ className, icon, title, rightHandler, ...props }, ref) => {
  const Icon = icon
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-between gap-3 pb-3 mb-4 border-b border-border-subtle", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-800 border border-amber-500/30">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
        )}
        <h3 className="text-base font-semibold text-fg-primary">{title}</h3>
      </div>
      {rightHandler && <div className="flex-shrink-0">{rightHandler}</div>}
    </div>
  )
})
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

const CardEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-center py-6 text-fg-tertiary text-sm", className)}
    {...props}
  />
))
CardEmpty.displayName = "CardEmpty"

interface SimpleCardProps {
  title: string
  description?: string | null
  selected?: boolean
  onClick?: () => void
  onDelete?: () => void
  children?: React.ReactNode
}

const SimpleCard = React.forwardRef<HTMLDivElement, SimpleCardProps>(
  ({ title, description, selected, onClick, onDelete, children }, ref) => (
    <div
      ref={ref}
      className={`border rounded-lg p-4 group cursor-pointer transition-colors ${selected ? "border-primary shadow-sm" : "hover:border-primary/50"
        }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-medium text-sm">{title}</h3>
        {onDelete && (
          <Button variant="destructive" size="auto" onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}>
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>

        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  ),
)
SimpleCard.displayName = "SimpleCard"

export { Card, CardHeader, CardContent, CardEmpty, SimpleCard }