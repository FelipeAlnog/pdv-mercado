'use client';

import { useState } from 'react';
import { Sale } from '@/types/sale';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';
import { FileText } from 'lucide-react';

const paymentLabel = (method: string) =>
  PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;

interface SaleHistoryProps {
  sales: Sale[];
}

export function SaleHistory({ sales }: SaleHistoryProps) {
  const [selected, setSelected] = useState<Sale | null>(null);

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <FileText className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Nenhuma venda registrada</p>
        <p className="mt-1 text-xs text-muted-foreground/70">As vendas finalizadas aparecerão aqui</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className={`rounded-xl border p-4 ${
              sale.paymentMethod === 'pending'
                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/10'
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-gray-500">{sale.id.slice(0, 16)}…</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(sale.createdAt)}</p>
              </div>
              <p className="shrink-0 font-bold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="info">{sale.items.length} produto{sale.items.length !== 1 ? 's' : ''}</Badge>
                <Badge
                  variant={
                    sale.paymentMethod === 'pending'
                      ? 'warning'
                      : sale.paymentMethod === 'cash'
                      ? 'default'
                      : sale.paymentMethod === 'pix'
                      ? 'success'
                      : 'info'
                  }
                >
                  {paymentLabel(sale.paymentMethod)}
                </Badge>
                {sale.customerName && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">{sale.customerName}</span>
                )}
              </div>
              <button
                onClick={() => setSelected(sale)}
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">ID da Venda</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wide">Itens</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Pagamento</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Cliente</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Total</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Data</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className={sale.paymentMethod === 'pending' ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {sale.id.slice(0, 16)}…
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="info">
                    {sale.items.length} produto{sale.items.length !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sale.paymentMethod === 'pending'
                        ? 'warning'
                        : sale.paymentMethod === 'cash'
                        ? 'secondary'
                        : sale.paymentMethod === 'pix'
                        ? 'success'
                        : 'info'
                    }
                  >
                    {paymentLabel(sale.paymentMethod)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {sale.customerName ?? <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(sale.total)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(sale.createdAt)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelected(sale)}
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Detalhes →
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">ID</p>
                  <p className="mt-0.5 font-mono text-xs font-medium">{selected.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Data</p>
                  <p className="mt-0.5 font-medium">{formatDate(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pagamento</p>
                  <p className="mt-0.5 font-medium">{paymentLabel(selected.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total</p>
                  <p className="mt-0.5 text-lg font-bold text-primary">
                    {formatCurrency(selected.total)}
                  </p>
                </div>
                {selected.customerName && (
                  <div className="col-span-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">Cliente (A Receber)</p>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-200">{selected.customerName}</p>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs uppercase tracking-wide">Produto</TableHead>
                      <TableHead className="text-center text-xs uppercase tracking-wide">Qtd</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Unit.</TableHead>
                      <TableHead className="text-right text-xs uppercase tracking-wide">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">
                        Total
                      </TableCell>
                      <TableCell className="text-right text-base font-bold text-primary">
                        {formatCurrency(selected.total)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
