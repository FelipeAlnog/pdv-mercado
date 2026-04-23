'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DebtorList } from '@/features/debtors/components/DebtorList';
import { Spinner } from '@/components/ui/Spinner';
import { useSaleStore } from '@/store/useSaleStore';
import { formatCurrency } from '@/utils/formatters';

type Filter = 'all' | 'today';

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  const today = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

export default function DebtorsPage() {
  const { fetchSales, getAllPendingSales, loadingState, sales } = useSaleStore();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const isLoading = loadingState === 'loading' && sales.length === 0;
  const pendingSales = getAllPendingSales();
  const dueTodaySales = pendingSales.filter((s) => isToday(s.dueDate));

  const visibleSales = filter === 'today' ? dueTodaySales : pendingSales;
  const totalPending = pendingSales.reduce((acc, s) => acc + s.total, 0);
  const uniqueCustomers = new Set(pendingSales.map((s) => s.customerName ?? 'Sem nome')).size;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header
        title="A Receber"
        subtitle={`${uniqueCustomers} cliente${uniqueCustomers !== 1 ? 's' : ''} com saldo pendente`}
      />

      {/* Summary */}
      {pendingSales.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">Total a receber</p>
            <p className="mt-1 text-3xl font-bold text-yellow-900 dark:text-yellow-200">
              {formatCurrency(totalPending)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500">Vendas pendentes</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {pendingSales.length}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              de {uniqueCustomers} cliente{uniqueCustomers !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'today'
              ? 'bg-yellow-500 text-white'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          Vencem hoje
          {dueTodaySales.length > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${filter === 'today' ? 'bg-white/30 text-white' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>
              {dueTodaySales.length}
            </span>
          )}
        </button>
      </div>

      {filter === 'today' && dueTodaySales.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum vencimento para hoje.</p>
      )}

      <DebtorList sales={visibleSales} />
    </div>
  );
}
