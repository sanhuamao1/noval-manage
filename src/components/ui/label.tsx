"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

const labelVariants = cva(
  "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-bg-200"
)

const labelContainerVariants = cva(
  "flex items-center gap-1.5 text-muted-foreground text-xs"
)

interface LabelRootProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  icon?: LucideIcon
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelRootProps & VariantProps<typeof labelVariants>
>(({ className, icon, children, ...props }, ref) => {
  const IconComponent = icon
  return (
    <LabelPrimitive.Root
      ref={ref as React.Ref<HTMLLabelElement>}
      className={cn(labelContainerVariants(), className)}
      {...(props as React.LabelHTMLAttributes<HTMLLabelElement>)}
    >
      {IconComponent && <IconComponent className="w-3 h-3 text-muted-foreground" />}
      {children}
    </LabelPrimitive.Root>
  )
})
Label.displayName = "Label"

export { Label }