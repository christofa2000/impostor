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
        "bg-white/5 backdrop-blur-xl",
        "border border-white/10",
        "shadow-[0_0_60px_rgba(0,0,0,0.7),_inset_0_0_20px_rgba(255,255,255,0.03)]",
        "p-6",
        onClick && "cursor-pointer transition-all hover:bg-white/[0.07] active:scale-[0.98]",
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
