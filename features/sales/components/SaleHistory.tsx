'use client';

import { useState } from 'react';
import { Sale } from '@/types/sale';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';

const paymentLabel = (method: string) =>
  PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;

interface SaleHistoryProps {
  sales: Sale[];
}

export function SaleHistory({ sales }: SaleHistoryProps) {
  const [selected, setSelected] = useState<Sale | null>(null);

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-600">
        <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm text-gray-500">Nenhuma venda registrada</p>
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
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 md:block dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">ID da Venda</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">Itens</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Pagamento</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Cliente</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Total</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Data</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className={`transition-colors ${
                  sale.paymentMethod === 'pending'
                    ? 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20'
                    : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50'
                }`}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{sale.id.slice(0, 16)}…</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="info">{sale.items.length} produto{sale.items.length !== 1 ? 's' : ''}</Badge>
                </td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {sale.customerName ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(sale.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(sale)}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalhes da Venda"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="font-mono font-medium">{selected.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data</p>
                <p className="font-medium">{formatDate(selected.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pagamento</p>
                <Badge
                  variant={
                    selected.paymentMethod === 'pending'
                      ? 'warning'
                      : selected.paymentMethod === 'cash'
                      ? 'default'
                      : selected.paymentMethod === 'pix'
                      ? 'success'
                      : 'info'
                  }
                >
                  {paymentLabel(selected.paymentMethod)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(selected.total)}</p>
              </div>
              {selected.customerName && (
                <div className="col-span-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-700 dark:bg-yellow-900/20">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">Cliente (A Receber)</p>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-200">{selected.customerName}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500">
                    <th className="px-3 py-2 text-left">Produto</th>
                    <th className="px-3 py-2 text-center">Qtd</th>
                    <th className="px-3 py-2 text-right">Unit.</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {selected.items.map((item, i) => (
                    <tr key={i} className="dark:bg-gray-800">
                      <td className="px-3 py-2 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 dark:border-gray-600">
                    <td colSpan={3} className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">Total</td>
                    <td className="px-3 py-2 text-right text-lg font-bold text-blue-600">{formatCurrency(selected.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
