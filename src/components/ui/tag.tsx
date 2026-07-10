import { cn } from "@/lib/utils"
import type { ComponentType } from "react"

type TagColor = "primary" | "success" | "warn" | "default"

const colorStyles: Record<TagColor, string> = {
  primary:
    "bg-amber-500/10 text-amber-400 border-amber-500/25",
  success:
    "bg-green-500/10 text-green-400 border-green-500/25",
  warn:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  default:
    "bg-bg-800 text-fg-secondary border-border-subtle",
}

interface TagProps {
  icon?: ComponentType<{ className?: string }>
  color?: TagColor
  children: React.ReactNode
  className?: string
}

export function Tag({ icon: Icon, color = "default", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorStyles[color],
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}
