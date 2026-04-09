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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 dark:border-slate-700">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nenhuma venda registrada</p>
        <p className="mt-1 text-xs text-slate-400">As vendas finalizadas aparecerão aqui</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  ID da Venda
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Itens
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Pagamento
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Data
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                    {sale.id.slice(0, 16)}…
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant="info">
                      {sale.items.length} produto{sale.items.length !== 1 ? 's' : ''}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        sale.paymentMethod === 'cash'
                          ? 'default'
                          : sale.paymentMethod === 'pix'
                          ? 'success'
                          : 'info'
                      }
                    >
                      {paymentLabel(sale.paymentMethod)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(sale.total)}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(sale.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setSelected(sale)}
                      className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Detalhes →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalhes da Venda" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/50">
              <div>
                <p className="text-xs font-medium text-slate-400">ID</p>
                <p className="mt-0.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-200">
                  {selected.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Data</p>
                <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                  {formatDate(selected.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Pagamento</p>
                <p className="mt-0.5 font-medium text-slate-900 dark:text-white">
                  {paymentLabel(selected.paymentMethod)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total</p>
                <p className="mt-0.5 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(selected.total)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Produto
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qtd
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit.
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selected.items.map((item, i) => (
                    <tr key={i} className="dark:bg-slate-900">
                      <td className="px-3 py-2.5 font-medium text-slate-900 dark:text-white">
                        {item.productName}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700">
                    <td colSpan={3} className="px-3 py-3 text-right text-sm font-medium text-slate-500">
                      Total
                    </td>
                    <td className="px-3 py-3 text-right text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(selected.total)}
                    </td>
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
