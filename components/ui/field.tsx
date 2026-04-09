/**
 * Field — wraps shadcn Input with label, error, hint, and icon slots.
 * Drop-in replacement for our old custom Input component.
 */
import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FieldProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-2.5 text-muted-foreground">
              {leftIcon}
            </span>
          )}
          <Input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            className={cn(leftIcon && "pl-9", rightIcon && "pr-9", className)}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute right-2.5 text-muted-foreground">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    )
  }
)

Field.displayName = "Field"

export { Field }
