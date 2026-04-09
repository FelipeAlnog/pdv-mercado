'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { LowStockAlert } from '@/features/dashboard/components/LowStockAlert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useProductStore } from '@/store/useProductStore';
import { useSaleStore } from '@/store/useSaleStore';
import { formatCurrency } from '@/utils/formatters';

export default function DashboardPage() {
  const { products, fetchProducts, loadingState: productsState } = useProductStore();
  const { fetchSales, getTodaySales, getTodayRevenue, loadingState: salesState } = useSaleStore();

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  const isLoading =
    (productsState === 'loading' || salesState === 'loading') && products.length === 0;

  const todaySales = getTodaySales();
  const todayRevenue = getTodayRevenue();
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header
        title="Dashboard"
        subtitle={`Resumo do dia — ${new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}`}
        actions={
          <Link href="/sales">
            <Button>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Venda
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Vendas hoje"
          value={todaySales.length}
          subtitle="transações realizadas"
          gradient="from-blue-500 to-blue-600"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="Faturamento hoje"
          value={formatCurrency(todayRevenue)}
          subtitle="receita acumulada"
          gradient="from-emerald-500 to-emerald-600"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Produtos cadastrados"
          value={products.length}
          subtitle="no catálogo"
          gradient="from-violet-500 to-violet-600"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatsCard
          title="Baixo estoque"
          value={lowStockProducts.length}
          subtitle="precisam de reposição"
          gradient="from-amber-500 to-orange-500"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Low Stock Alert */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Alerta de Estoque</h2>
        <LowStockAlert products={lowStockProducts} />
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Acesso Rápido</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/products">
            <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Gerenciar Produtos</p>
                <p className="text-sm text-slate-500">Cadastrar, editar e controlar estoque</p>
              </div>
            </div>
          </Link>
          <Link href="/sales">
            <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Registrar Venda</p>
                <p className="text-sm text-slate-500">PDV rápido com leitor de código</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
