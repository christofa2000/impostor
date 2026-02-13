import * as React from "react"
import { cn } from "@/lib/utils"

interface PremiumCardProps extends React.ComponentProps<"div"> {
  onClick?: () => void
}

function PremiumCard({
  className,
  children,
  onClick,
  ...props
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        "bg-gradient-to-br from-card via-card to-card/95",
        "backdrop-blur-md",
        "border border-white/15",
        "shadow-xl shadow-blue-500/5",
        "p-4 sm:p-5",
        "min-h-[160px]",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:border-white/20 hover:shadow-blue-500/10 active:scale-[0.98]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export { PremiumCard }
