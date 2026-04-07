'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-100 p-3 text-green-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Estoque OK</p>
            <p className="text-sm text-gray-500">Todos os produtos estão com estoque adequado</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Produtos com Baixo Estoque
          </h3>
          <Badge variant="warning">{products.length}</Badge>
        </div>
        <Link href="/products?lowStock=true" className="text-sm text-blue-600 hover:underline">
          Ver todos
        </Link>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {products.slice(0, 5).map((product) => (
          <li key={product.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
              <p className="text-xs text-gray-400">{product.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{formatCurrency(product.price)}</span>
              <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                {product.stock} / {product.minStock} min
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
