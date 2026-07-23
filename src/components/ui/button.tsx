import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "text-danger hover:bg-danger/10",
        outline: "hover:bg-primary/10",
        secondary: "text-muted-foreground hover:text-primary",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        radio: "text-muted-foreground",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-2 text-xs py-1",
        auto: "p-1",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** 激活态：显示 hover 背景色 */
  isActive?: boolean
}

const activeBgMap: Record<string, string> = {
  default: "bg-primary/90",
  destructive: "bg-danger/10",
  outline: "bg-primary/10",
  secondary: "text-primary",
  ghost: "bg-accent",
  link: "",
  radio: "text-primary"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isActive, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), isActive && activeBgMap[variant || "default"])}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

const AddButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      size="icon"
      className={cn("rounded-lg", className)}
      {...props}
    >
      <Plus className="w-3 h-3" />
    </Button>
  )
)
AddButton.displayName = "AddButton"

export { Button, buttonVariants, AddButton }
