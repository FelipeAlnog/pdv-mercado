/**
 * SimpleSelect — wraps shadcn Select with a flat options array API.
 * Replaces the old native-<select> based component.
 */
"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SimpleSelectProps {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  id?: string
}

function SimpleSelect({
  label,
  error,
  options,
  placeholder,
  value,
  onValueChange,
  disabled,
  className,
  id,
}: SimpleSelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label htmlFor={selectId} className={cn(error && "text-destructive")}>
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          aria-invalid={!!error}
          className={cn("w-full", className)}
        >
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value || "__empty__"}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export { SimpleSelect }
