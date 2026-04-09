import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
    />
  )
}
