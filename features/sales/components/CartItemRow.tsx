'use client';

import { motion } from 'framer-motion';
import { CartItem } from '@/types/sale';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.productName}</p>
        <p className="font-mono text-xs text-muted-foreground">{item.barcode}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          aria-label="Diminuir quantidade"
        >
          <Minus />
        </Button>

        <motion.span
          key={item.quantity}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="w-8 text-center text-sm font-bold"
        >
          {item.quantity}
        </motion.span>

        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          aria-label="Aumentar quantidade"
        >
          <Plus />
        </Button>
      </div>

      {/* Price */}
      <div className="min-w-20 text-right">
        <motion.p
          key={item.subtotal}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-semibold"
        >
          {formatCurrency(item.subtotal)}
        </motion.p>
        <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} / un</p>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => removeItem(item.productId)}
        aria-label="Remover item"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X />
      </Button>
    </div>
  );
}
