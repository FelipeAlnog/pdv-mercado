/**
 * Badge — extends shadcn Badge with semantic color variants (success, warning, danger, info).
 */
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary dark:bg-primary/20",
        secondary:
          "bg-muted text-muted-foreground",
        success:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
        danger:
          "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
        info:
          "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
        outline:
          "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
