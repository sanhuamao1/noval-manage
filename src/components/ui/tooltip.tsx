"use client"

import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: "top" | "bottom"
  className?: string
}

export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    clearTimeout(timerRef.current)
    setOpen(true)
  }

  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 100)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1.5 rounded-md bg-popover text-popover-foreground text-xs shadow-md whitespace-pre-wrap break-words w-60 pointer-events-none",
            "animate-in fade-in duration-150",
            side === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
              : "top-full left-1/2 -translate-x-1/2 mt-2",
            className,
          )}
        >
          {content}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45",
              side === "top" ? "top-full -mt-1" : "bottom-full mb-1",
            )}
          />
        </div>
      )}
    </div>
  )
}
