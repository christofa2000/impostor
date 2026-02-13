import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border-0 shadow-none focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-2 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        primaryGlow: cn(
          "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
          "hover:from-blue-600 hover:via-blue-700 hover:to-blue-800",
          "text-white font-semibold",
          "shadow-lg shadow-blue-500/40",
          "hover:shadow-xl hover:shadow-blue-500/50",
          "active:scale-[0.98] transition-all duration-200"
        ),
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-white/20 bg-white/5 text-white hover:bg-blue-600/20 hover:border-blue-400/40 hover:text-white dark:bg-white/5 dark:border-white/20 dark:hover:bg-blue-600/20",
        secondary:
          "bg-blue-600/80 text-white hover:bg-blue-600",
        accent:
          "bg-blue-600 text-white hover:bg-blue-700",
        ghost:
          "text-white/90 hover:bg-blue-600/20 hover:text-white",
        link: "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        premium: "w-full rounded-full py-4 text-lg font-semibold active:scale-95 transition-all duration-150",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
