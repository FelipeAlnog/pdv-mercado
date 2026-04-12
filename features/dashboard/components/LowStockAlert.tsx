'use client';

import Link from 'next/link';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Estoque OK</p>
              <p className="text-sm text-muted-foreground">
                Todos os produtos estão com estoque adequado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span className="font-semibold">Produtos com Baixo Estoque</span>
          <Badge variant="warning">{products.length}</Badge>
        </div>
        <Link
          href="/products?lowStock=true"
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Ver todos →
        </Link>
      </CardHeader>

      {/* List */}
      <ul>
        {products.slice(0, 5).map((product, idx) => (
          <li key={product.id}>
            <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <span className="text-sm text-muted-foreground">{formatCurrency(product.price)}</span>
                <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                  {product.stock} / {product.minStock} min
                </Badge>
              </div>
            </div>
            {idx < Math.min(products.length, 5) - 1 && <Separator />}
          </li>
        ))}
      </ul>
    </Card>
  );
}
