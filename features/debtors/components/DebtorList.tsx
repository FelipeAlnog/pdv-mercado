'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sale, PaymentMethod } from '@/types/sale';
import { useSaleStore } from '@/store/useSaleStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';

interface DebtorGroup {
  customerName: string;
  customerPhone?: string;
  sales: Sale[];
  total: number;
  earliestDueDate?: string;
}

function getDueStatus(dueDate?: string): { label: string; variant: 'danger' | 'warning' | 'default' } {
  if (!dueDate) return { label: 'Sem vencimento', variant: 'default' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: `Vencido há ${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''}`, variant: 'danger' };
  if (diff === 0) return { label: 'Vence hoje', variant: 'warning' };
  return { label: `Vence em ${diff} dia${diff !== 1 ? 's' : ''}`, variant: 'default' };
}

function buildWhatsAppLink(phone: string, name: string, total: number, dueDate?: string): string {
  const digits = phone.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  const due = dueDate
    ? ` com vencimento em ${new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
    : '';
  const msg = `Olá ${name}! Você possui um saldo em aberto de ${formatCurrency(total)} no nosso mercado${due}. Por favor, entre em contato para realizar o pagamento. Obrigado!`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

const confirmPaymentMethods = PAYMENT_METHODS.filter((m) => m.value !== 'pending');

interface DebtorListProps {
  sales: Sale[];
}

export function DebtorList({ sales }: DebtorListProps) {
  const { updateSale } = useSaleStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [paying, setPaying] = useState<{ saleId: string; customerName: string } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [loadingPay, setLoadingPay] = useState(false);

  // Group by customerName
  const groups: DebtorGroup[] = Object.values(
    sales.reduce<Record<string, DebtorGroup>>((acc, sale) => {
      const key = sale.customerName ?? 'Sem nome';
      if (!acc[key]) {
        acc[key] = { customerName: key, customerPhone: sale.customerPhone, sales: [], total: 0 };
      }
      acc[key].sales.push(sale);
      acc[key].total += sale.total;
      if (sale.dueDate) {
        if (!acc[key].earliestDueDate || sale.dueDate < acc[key].earliestDueDate!) {
          acc[key].earliestDueDate = sale.dueDate;
        }
      }
      return acc;
    }, {})
  ).sort((a, b) => {
    // Overdue first
    if (a.earliestDueDate && b.earliestDueDate) return a.earliestDueDate.localeCompare(b.earliestDueDate);
    if (a.earliestDueDate) return -1;
    if (b.earliestDueDate) return 1;
    return a.customerName.localeCompare(b.customerName);
  });

  async function handleMarkPaid() {
    if (!paying) return;
    setLoadingPay(true);
    try {
      await updateSale(paying.saleId, { paymentMethod: selectedMethod });
      toast.success('Venda marcada como paga!');
      setPaying(null);
    } catch {
      toast.error('Erro ao atualizar venda.');
    } finally {
      setLoadingPay(false);
    }
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-600">
        <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Nenhum valor pendente</p>
        <p className="text-xs text-gray-400">Todas as vendas estão quitadas</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {groups.map((group) => {
          const dueStatus = getDueStatus(group.earliestDueDate);
          const isOpen = expanded === group.customerName;

          return (
            <div
              key={group.customerName}
              className={`rounded-xl border bg-white transition-shadow dark:bg-gray-800 ${
                dueStatus.variant === 'danger'
                  ? 'border-red-200 dark:border-red-800'
                  : dueStatus.variant === 'warning'
                  ? 'border-yellow-200 dark:border-yellow-700'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start gap-3 p-4">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {group.customerName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{group.customerName}</p>
                    <Badge variant={dueStatus.variant}>{dueStatus.label}</Badge>
                  </div>
                  {group.customerPhone && (
                    <p className="text-xs text-gray-500 mt-0.5">{group.customerPhone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {group.sales.length} venda{group.sales.length !== 1 ? 's' : ''} pendente{group.sales.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Total */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(group.total)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-700">
                {group.customerPhone && (
                  <a
                    href={buildWhatsAppLink(group.customerPhone, group.customerName, group.total, group.earliestDueDate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                )}

                <button
                  onClick={() => setExpanded(isOpen ? null : group.customerName)}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                >
                  {isOpen ? 'Ocultar' : 'Ver vendas'}
                  <svg className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded sales */}
              {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  {group.sales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-0 border-gray-50 dark:border-gray-700/50">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-gray-400">{sale.id.slice(0, 14)}…</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(sale.createdAt)} · {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}</p>
                        {sale.dueDate && (
                          <p className="text-xs text-gray-400">Venc.: {new Date(sale.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(sale.total)}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setPaying({ saleId: sale.id, customerName: group.customerName }); setSelectedMethod('cash'); }}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mark as paid modal */}
      <Modal
        open={!!paying}
        onClose={() => setPaying(null)}
        title="Registrar pagamento"
        size="sm"
      >
        {paying && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecione a forma de pagamento recebida de <strong>{paying.customerName}</strong>:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {confirmPaymentMethods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMethod(m.value as PaymentMethod)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    selectedMethod === m.value
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-blue-400 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={() => setPaying(null)} disabled={loadingPay} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleMarkPaid} loading={loadingPay} className="flex-1">
                Confirmar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
