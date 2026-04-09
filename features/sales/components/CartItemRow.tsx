'use client';

import { CartItem } from '@/types/sale';
import { useCartStore } from '@/store/useCartStore';
import { formatCurrency } from '@/utils/formatters';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.productName}</p>
        <p className="font-mono text-xs text-slate-400">{item.barcode}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
          aria-label="Diminuir quantidade"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
          aria-label="Aumentar quantidade"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Price */}
      <div className="min-w-20 text-right">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</p>
        <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} / un</p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.productId)}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        aria-label="Remover item"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
