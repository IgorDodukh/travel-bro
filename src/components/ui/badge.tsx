import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        outline: "text-foreground",
        accent:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        "suggested-poi":
          "border border-primary/30 bg-primary/20 text-primary",
        "custom-poi":
          "border border-blue-500/30 bg-blue-500/20 text-blue-500",
        "category":
          "border border-gray-500/30 bg-gray-500/20 text-white-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className, "mr-2")} {...props} />
  )
}

export { Badge, badgeVariants }
