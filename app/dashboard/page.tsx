'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { LowStockAlert } from '@/features/dashboard/components/LowStockAlert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { useProductStore } from '@/store/useProductStore';
import { useSaleStore } from '@/store/useSaleStore';
import { formatCurrency } from '@/utils/formatters';
import { Plus, Package, ShoppingCart, FileText, AlertTriangle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { products, fetchProducts, loadingState: productsState } = useProductStore();
  const { fetchSales, getTodaySales, getTodayRevenue, getTodayPendingSales, getTodayPendingRevenue, loadingState: salesState } = useSaleStore();

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  const isLoading =
    (productsState === 'loading' || salesState === 'loading') && products.length === 0;

  const todaySales = getTodaySales();
  const todayRevenue = getTodayRevenue();
  const todayPendingSales = getTodayPendingSales();
  const todayPendingRevenue = getTodayPendingRevenue();
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-primary" />
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
            <Button size="sm">
              <Plus />
              Nova Venda
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title="Vendas hoje"
          value={todaySales.length}
          subtitle="transações realizadas"
          gradient="from-blue-500 to-blue-600"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatsCard
          title="Faturamento hoje"
          value={formatCurrency(todayRevenue)}
          subtitle="receita acumulada"
          gradient="from-emerald-500 to-emerald-600"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatsCard
          title="A Receber"
          value={formatCurrency(todayPendingRevenue)}
          subtitle={`${todayPendingSales.length} venda${todayPendingSales.length !== 1 ? 's' : ''} pendente${todayPendingSales.length !== 1 ? 's' : ''}`}
          iconBg="bg-yellow-100 text-yellow-600"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Produtos cadastrados"
          value={products.length}
          subtitle="no catálogo"
          gradient="from-violet-500 to-violet-600"
          icon={<Package className="h-6 w-6" />}
        />
        <StatsCard
          title="Baixo estoque"
          value={lowStockProducts.length}
          subtitle="precisam de reposição"
          gradient="from-amber-500 to-orange-500"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      {/* Low Stock Alert */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Alerta de Estoque</h2>
        <LowStockAlert products={lowStockProducts} />
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Acesso Rápido</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/products">
            <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Gerenciar Produtos</p>
                <p className="text-sm text-muted-foreground">Cadastrar, editar e controlar estoque</p>
              </div>
            </div>
          </Link>
          <Link href="/sales">
            <div className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-emerald-400/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Registrar Venda</p>
                <p className="text-sm text-muted-foreground">PDV rápido com leitor de código</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
