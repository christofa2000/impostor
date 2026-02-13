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
        "bg-card/40 backdrop-blur-xl",
        "border border-primary/30 dark:border-secondary/30",
        "p-6",
        onClick && "cursor-pointer transition-all hover:bg-card/50 hover:border-primary/50 active:scale-[0.98]",
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
