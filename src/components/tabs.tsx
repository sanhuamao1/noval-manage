"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

// ── Context ──────────────────────────────────────────

interface TabsContextValue {
  active: string
  setActive: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs compound components must be used within <Tabs>")
  return ctx
}

// ── Tabs (root) ──────────────────────────────────────

interface TabsProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
}

function Tabs({ defaultValue, className, children }: TabsProps) {
  const [active, setActive] = React.useState(defaultValue)

  const childrenArr = React.Children.toArray(children)
  const tabsList = childrenArr.find(
    (child) => React.isValidElement(child) && (child.type as any)?.displayName === "TabsList"
  )
  const contentChildren = childrenArr.filter(
    (child) => !(React.isValidElement(child) && (child.type as any)?.displayName === "TabsList")
  )

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("rounded-xl", className)}>
        {tabsList}
        <div className="p-6 bg-bg-700 rounded-b-xl border border-border-subtle">
          {contentChildren}
        </div>
      </div>
    </TabsContext.Provider>
  )
}

// ── TabsList ──────────────────────────────────────────

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-0 px-4 pt-4", className)}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

// ── TabsTrigger ───────────────────────────────────────

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  icon?: LucideIcon
  label: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, icon: Icon, label, ...props }, ref) => {
    const { active, setActive } = useTabs()
    const isActive = active === value

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px relative",
          isActive
            ? "bg-bg-700 text-amber-400 rounded-t-lg border border-border-subtle border-b-transparent"
            : "text-fg-tertiary hover:text-fg-secondary hover:bg-bg-700/50 rounded-t-lg border border-transparent",
          className
        )}
        onClick={() => setActive(value)}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

// ── TabsContent ───────────────────────────────────────

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  actionIcon?: LucideIcon
  onAction?: () => void
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, actionIcon: ActionIcon, onAction, children, ...props }, ref) => {
    const { active } = useTabs()
    if (active !== value) return null

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {onAction && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -top-0 -left-14 w-8 h-8 bg-bg-700 border-border-subtle border-r-0 rounded-r-none"
            onClick={onAction}
          >
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
          </Button>
        )}
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
