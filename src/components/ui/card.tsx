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
  Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
    icon?: LucideIcon
    title: React.ReactNode
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
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-bg-800 border border-amber-500/30 shrink-0">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
        )}
        <div className="text-base font-semibold text-fg-primary truncate">{title}</div>
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
    className={cn(className)}
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
  icon?: LucideIcon
  size?: "sm" | "md"
  selected?: boolean
  onClick?: () => void
  onDelete?: () => void
  children?: React.ReactNode
}

const sizeStyles = {
  sm: {
    icon: "w-4 h-4",
    containerGap: "gap-3",
    containerPadding: "p-4",
    title: "text-sm",
    description: "text-xs",
    children: "mt-2",
  },
  md: {
    icon: "w-5 h-5",
    containerGap: "gap-4",
    containerPadding: "p-5",
    title: "text-base",
    description: "text-sm",
    children: "mt-3",
  },
} as const

const SimpleCard = React.forwardRef<HTMLDivElement, SimpleCardProps>(
  ({ title, description, size: sizeProp = "sm", icon: Icon, selected, onClick, onDelete, children }, ref) => {
    const s = sizeStyles[sizeProp]
    return (
      <div
        ref={ref}
        className={`border rounded-lg ${s.containerPadding} bg-bg-800 group cursor-pointer transition-colors ${selected ? "border-primary shadow-sm" : "hover:border-primary/50"
          }`}
        onClick={onClick}
      >
        <div className={`flex ${s.containerGap}`}>
          {Icon && (
            <div className="flex items-start pt-0.5 shrink-0">
              <Icon className={`${s.icon} text-muted-foreground`} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className={`font-medium ${s.title} truncate`}>{title}</h3>
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
              <p className={`${s.description} text-muted-foreground`}>
                {description.length > 100 ? `${description.slice(0, 100)}...` : description}
              </p>
            )}
            {children && <div className={s.children}>{children}</div>}
          </div>
        </div>
      </div>
    )
  },
)
SimpleCard.displayName = "SimpleCard"

export { Card, CardHeader, CardContent, CardEmpty, SimpleCard }