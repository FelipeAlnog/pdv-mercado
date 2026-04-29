'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePageHeader } from '@/hooks/usePageHeader';
import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { LowStockAlert } from '@/features/dashboard/components/LowStockAlert';
import { SalesDetailModal } from '@/features/dashboard/components/SalesDetailModal';
import { Button } from '@/components/ui/button';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { Spinner } from '@/components/ui/Spinner';
import { useProductStore } from '@/store/useProductStore';
import { useSaleStore } from '@/store/useSaleStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { exportToExcelMultiSheet, exportToPDFMultiSection } from '@/lib/export';
import { Plus, Package, ShoppingCart, FileText, AlertTriangle, DollarSign } from 'lucide-react';
import { STAGGER_CONTAINER, EASE_OUT } from '@/lib/motion';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  card: 'Cartão',
  pix: 'PIX',
  pending: 'Fiado',
};

export default function DashboardPage() {
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const { products, fetchProducts, loadingState: productsState } = useProductStore();
  const { fetchSales, getTodaySales, getTodayRevenue, getTodayPendingSales, getTodayPendingRevenue, loadingState: salesState } = useSaleStore();

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  const isLoading = (productsState === 'loading' || salesState === 'loading') && products.length === 0;

  const todaySales          = getTodaySales();
  const todayRevenue        = getTodayRevenue();
  const todayPendingSales   = getTodayPendingSales();
  const todayPendingRevenue = getTodayPendingRevenue();
  const lowStockProducts    = products.filter((p) => p.stock <= p.minStock);

  function handleExportExcel() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToExcelMultiSheet(`dashboard-${date}`, [
      {
        name: 'Resumo',
        headers: ['Métrica', 'Valor'],
        rows: [
          ['Vendas hoje',              todaySales.length],
          ['Faturamento hoje',         formatCurrency(todayRevenue)],
          ['A Receber (hoje)',         formatCurrency(todayPendingRevenue)],
          ['Vendas pendentes (hoje)',  todayPendingSales.length],
          ['Total de produtos',        products.length],
          ['Produtos com baixo estoque', lowStockProducts.length],
        ],
      },
      {
        name: 'Vendas Hoje',
        headers: ['Data', 'Cliente', 'Itens', 'Total', 'Pagamento', 'Status'],
        rows: todaySales.map((s) => [
          formatDate(s.createdAt),
          s.customerName ?? '—',
          s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
          formatCurrency(s.total),
          PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod,
          s.paidAt ? 'Pago' : s.paymentMethod === 'pending' ? 'Pendente' : 'Concluído',
        ]),
      },
      {
        name: 'Baixo Estoque',
        headers: ['Nome', 'Categoria', 'Estoque', 'Estoque Mínimo'],
        rows: lowStockProducts.map((p) => [p.name, p.category, p.stock, p.minStock]),
      },
    ]);
  }

  function handleExportPDF() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToPDFMultiSection(
      'Relatório do Dashboard',
      [
        {
          subtitle: 'Resumo do Dia',
          headers: ['Métrica', 'Valor'],
          rows: [
            ['Vendas hoje',                String(todaySales.length)],
            ['Faturamento hoje',           formatCurrency(todayRevenue)],
            ['A Receber (hoje)',           formatCurrency(todayPendingRevenue)],
            ['Vendas pendentes (hoje)',    String(todayPendingSales.length)],
            ['Total de produtos',          String(products.length)],
            ['Produtos com baixo estoque', String(lowStockProducts.length)],
          ],
        },
        {
          subtitle: 'Vendas do Dia',
          headers: ['Data', 'Cliente', 'Itens', 'Total', 'Pagamento', 'Status'],
          rows: todaySales.map((s) => [
            formatDate(s.createdAt),
            s.customerName ?? '—',
            s.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
            formatCurrency(s.total),
            PAYMENT_LABELS[s.paymentMethod] ?? s.paymentMethod,
            s.paidAt ? 'Pago' : s.paymentMethod === 'pending' ? 'Pendente' : 'Concluído',
          ]),
        },
        {
          subtitle: 'Produtos com Baixo Estoque',
          headers: ['Nome', 'Categoria', 'Estoque Atual', 'Estoque Mínimo'],
          rows: lowStockProducts.map((p) => [p.name, p.category || '—', p.stock, p.minStock]),
        },
      ],
      `dashboard-${date}`,
      true,
    );
  }

  usePageHeader({
    title: 'Dashboard',
    subtitle: `Resumo do dia — ${new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })}`,
    actions: (
      <div className="flex items-center gap-2">
        <ExportMenu onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
        <Link href="/sales">
          <Button size="sm">
            <Plus />
            Nova Venda
          </Button>
        </Link>
      </div>
    ),
  });

  if (isLoading) {
    return (
      <motion.div
        className="flex h-64 items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Spinner size="lg" className="text-primary" />
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Stats Grid — stagger */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
        >
          <StatsCard
            title="Vendas hoje"
            value={todaySales.length}
            subtitle="transações realizadas"
            gradient="from-blue-500 to-blue-600"
            icon={<FileText className="h-6 w-6" />}
            onClick={() => setSalesModalOpen(true)}
          />
          <StatsCard
            title="Faturamento hoje"
            value={formatCurrency(todayRevenue)}
            subtitle="receita acumulada"
            gradient="from-emerald-500 to-emerald-600"
            icon={<DollarSign className="h-6 w-6" />}
            onClick={() => setSalesModalOpen(true)}
          />
          <StatsCard
            title="A Receber"
            value={formatCurrency(todayPendingRevenue)}
            subtitle={`${todayPendingSales.length} venda${todayPendingSales.length !== 1 ? 's' : ''} pendente${todayPendingSales.length !== 1 ? 's' : ''}`}
            gradient="from-yellow-500 to-orange-500"
            icon={<FileText className="h-6 w-6" />}
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
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE_OUT, delay: 0.3 }}
        >
          <h2 className="text-base font-semibold">Alerta de Estoque</h2>
          <LowStockAlert products={lowStockProducts} />
        </motion.div>

        {/* Quick links */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE_OUT, delay: 0.4 }}
        >
          <h2 className="text-base font-semibold">Acesso Rápido</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/products">
              <motion.div
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-sm"
                  whileHover={{ rotate: -6, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <Package className="h-6 w-6" />
                </motion.div>
                <div>
                  <p className="font-semibold">Gerenciar Produtos</p>
                  <p className="text-sm text-muted-foreground">Cadastrar, editar e controlar estoque</p>
                </div>
              </motion.div>
            </Link>

            <Link href="/sales">
              <motion.div
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-emerald-400/50 hover:shadow-md"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm"
                  whileHover={{ rotate: 6, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <ShoppingCart className="h-6 w-6" />
                </motion.div>
                <div>
                  <p className="font-semibold">Registrar Venda</p>
                  <p className="text-sm text-muted-foreground">PDV rápido com leitor de código</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>

      <SalesDetailModal open={salesModalOpen} onClose={() => setSalesModalOpen(false)} />
    </>
  );
}
