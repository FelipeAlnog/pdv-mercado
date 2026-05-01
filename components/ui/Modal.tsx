"use client"

/**
 * Modal — backward-compatible wrapper around shadcn Dialog.
 * Existing API: open, onClose, title, children, footer, size.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  /** When true, modal only closes via X button or Cancel — not Escape or overlay click */
  locked?: boolean
}

const sizeClasses: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
}

export function Modal({ open, onClose, title, children, footer, size = "md", locked = false }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !locked && onClose()}>
      <DialogContent
        className={cn(sizeClasses[size])}
        onPointerDownOutside={locked ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={locked ? (e) => e.preventDefault() : undefined}
        onInteractOutside={locked ? (e) => e.preventDefault() : undefined}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <div>{children}</div>
        {footer && (
          <DialogFooter className="-mx-4 -mb-4 px-4 pb-4">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
