import * as React from "react"
import { cn } from "@/lib/utils"

export interface NoBorderInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NoBorderInput = React.forwardRef<HTMLInputElement, NoBorderInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-transparent border-none px-0 py-0",
          "font-semibold text-fg-primary",
          "outline-none",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
          "focus:border-b focus:border-amber-500/50",
          "placeholder:text-fg-tertiary",
          className,
        )}
        {...props}
      />
    )
  },
)
NoBorderInput.displayName = "NoBorderInput"

export { NoBorderInput }
