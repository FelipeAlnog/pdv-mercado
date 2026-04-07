'use client';

import { CartItem } from '@/types/sale';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.productName}</p>
        <p className="font-mono text-xs text-gray-400">{item.barcode}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400"
          aria-label="Diminuir quantidade"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400"
          aria-label="Aumentar quantidade"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Price info */}
      <div className="text-right min-w-20">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</p>
        <p className="text-xs text-gray-400">{formatCurrency(item.unitPrice)} / un</p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.productId)}
        className="ml-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
        aria-label="Remover item"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
