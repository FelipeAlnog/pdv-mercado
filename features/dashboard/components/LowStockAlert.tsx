'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">Estoque OK</p>
          <p className="text-sm text-slate-500">Todos os produtos estão com estoque adequado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Produtos com Baixo Estoque</h3>
          <Badge variant="warning">{products.length}</Badge>
        </div>
        <Link
          href="/products?lowStock=true"
          className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Ver todos →
        </Link>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {products.slice(0, 5).map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {product.name}
              </p>
              <p className="text-xs text-slate-400">{product.category}</p>
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-3">
              <span className="text-sm text-slate-500">{formatCurrency(product.price)}</span>
              <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                {product.stock} / {product.minStock} min
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
