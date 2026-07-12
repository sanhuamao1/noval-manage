import { cn } from "@/lib/utils"
import type { ComponentType } from "react"
import { TAG_COLORS, type ColorName } from "@/lib/colors"

export type TagColor = ColorName

interface TagProps {
  icon?: ComponentType<{ className?: string }>
  color?: ColorName
  /** rounded（默认圆角） | sharp（直角） */
  variant?: "rounded" | "sharp"
  children: React.ReactNode
  className?: string
}

export function Tag({ icon: Icon, color = "default", variant = "rounded", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium border",
        variant === "rounded" ? "rounded-full" : "rounded",
        TAG_COLORS[color],
        className,
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}
