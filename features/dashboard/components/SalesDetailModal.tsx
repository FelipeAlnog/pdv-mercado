'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSaleStore } from '@/store/useSaleStore';
import { formatCurrency } from '@/utils/formatters';
import { PaymentMethod, Sale } from '@/types/sale';
import { CreditCard, Banknote, QrCode, Clock, TrendingUp, ShoppingBag } from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────

const PAYMENT_CONFIG: Record<
  PaymentMethod,
  { label: string; color: string; bg: string; gradient: string; chartColor: string; icon: React.ReactNode }
> = {
  cash: {
    label: 'Dinheiro',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    gradient: 'from-emerald-500 to-emerald-600',
    chartColor: '#10b981',
    icon: <Banknote className="h-4 w-4" />,
  },
  card: {
    label: 'Cartão',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    gradient: 'from-blue-500 to-blue-600',
    chartColor: '#3b82f6',
    icon: <CreditCard className="h-4 w-4" />,
  },
  pix: {
    label: 'Pix',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    gradient: 'from-violet-500 to-violet-600',
    chartColor: '#8b5cf6',
    icon: <QrCode className="h-4 w-4" />,
  },
  pending: {
    label: 'Fiado',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    gradient: 'from-amber-500 to-orange-500',
    chartColor: '#f59e0b',
    icon: <Clock className="h-4 w-4" />,
  },
};

const PAYMENT_ORDER: PaymentMethod[] = ['cash', 'card', 'pix', 'pending'];

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ data }: { data: { method: PaymentMethod; total: number; count: number }[] }) {
  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  const totalCount = data.reduce((s, d) => s + d.count, 0);
  const vbSize = 200;
  const radius = 76;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  const cx = vbSize / 2;
  const cy = vbSize / 2;

  if (grandTotal === 0) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-full border-[22px] border-border">
        <span className="text-xs text-muted-foreground">sem dados</span>
      </div>
    );
  }

  let accumulated = 0;
  const segments = data
    .filter((d) => d.total > 0)
    .map((d) => {
      const dash = (d.total / grandTotal) * circumference;
      const seg = { ...d, dash, offset: accumulated };
      accumulated += dash;
      return seg;
    });

  return (
    <div className="relative w-full max-w-[200px] xl:max-w-[240px]">
      <svg viewBox={`0 0 ${vbSize} ${vbSize}`} className="w-full -rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor"
          strokeWidth={strokeWidth} className="text-border" />
        {segments.map((seg) => (
          <circle key={seg.method} cx={cx} cy={cy} r={radius} fill="none"
            stroke={PAYMENT_CONFIG[seg.method].chartColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
            className="transition-all duration-700"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold xl:text-3xl">{totalCount}</span>
        <span className="text-xs text-muted-foreground">vendas</span>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toInputDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function QuickBtn({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:py-2 sm:text-sm ${
        active
          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
          : 'border-border bg-secondary text-foreground hover:bg-secondary/70'
      }`}
    >
      {label}
    </button>
  );
}

function SaleCard({ sale }: { sale: Sale }) {
  const cfg = PAYMENT_CONFIG[sale.paymentMethod];
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">
          {new Date(sale.createdAt).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          })}
        </span>
        <span className="text-sm font-medium">
          {sale.items?.length ?? 0} item{(sale.items?.length ?? 0) !== 1 ? 's' : ''}
        </span>
        <span className={`mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          {cfg.icon}{cfg.label}
        </span>
      </div>
      <span className="text-base font-bold">{formatCurrency(sale.total)}</span>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface SalesDetailModalProps {
  open: boolean;
  onClose: () => void;
}

export function SalesDetailModal({ open, onClose }: SalesDetailModalProps) {
  const { sales } = useSaleStore();

  const today = new Date();
  const [startDate, setStartDate] = useState(toInputDate(today));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [activeFilter, setActiveFilter] = useState<'today' | '7d' | '30d' | 'month' | null>('today');

  const filtered: Sale[] = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    return sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= start && d <= end;
    });
  }, [sales, startDate, endDate]);

  const revenue = filtered
    .filter((s) => s.paymentMethod !== 'pending')
    .reduce((acc, s) => acc + s.total, 0);

  const byMethod = useMemo(
    () => PAYMENT_ORDER.map((method) => {
      const items = filtered.filter((s) => s.paymentMethod === method);
      return { method, count: items.length, total: items.reduce((a, s) => a + s.total, 0) };
    }),
    [filtered]
  );

  const grandTotal = byMethod.reduce((s, d) => s + d.total, 0);

  function setQuick(days: number, filter: typeof activeFilter) {
    const start = new Date(today);
    start.setDate(today.getDate() - days + 1);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(today));
    setActiveFilter(filter);
  }

  function setThisMonth() {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(toInputDate(start));
    setEndDate(toInputDate(today));
    setActiveFilter('month');
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/*
        Width strategy (mobile-first):
          mobile  → 95vw
          sm      → 88vw
          lg      → 80vw
          xl      → 75vw  (cap: 1200px)
          2xl     → 70vw  (cap: 1400px)
      */}
      <DialogContent
        className="
          flex flex-col gap-0 overflow-hidden p-0
          max-h-[95dvh]
          w-[95vw] max-w-none
          sm:w-[88vw]
          lg:w-[80vw]
          xl:w-[75vw] xl:max-w-[1200px]
          2xl:w-[70vw] 2xl:max-w-[1400px]
        "
      >
        {/* ── Sticky header + filters ─────────────────────────────────────── */}
        <div className="shrink-0 border-b border-border bg-card px-4 pb-4 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
              <TrendingUp className="h-5 w-5 shrink-0 text-primary lg:h-6 lg:w-6" />
              Relatório de Vendas
            </DialogTitle>
          </DialogHeader>

          {/* Filters: stacked on mobile, one row on lg+ */}
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Data inicial</label>
                <input type="date" value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setActiveFilter(null); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring lg:w-auto"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Data final</label>
                <input type="date" value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setActiveFilter(null); }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring lg:w-auto"
                />
              </div>
            </div>
            <div className="hidden h-8 w-px bg-border lg:block" />
            <div className="flex flex-wrap gap-2 lg:flex-nowrap">
              <QuickBtn label="Hoje" active={activeFilter === 'today'} onClick={() => { setStartDate(toInputDate(today)); setEndDate(toInputDate(today)); setActiveFilter('today'); }} />
              <QuickBtn label="7 dias" active={activeFilter === '7d'} onClick={() => setQuick(7, '7d')} />
              <QuickBtn label="30 dias" active={activeFilter === '30d'} onClick={() => setQuick(30, '30d')} />
              <QuickBtn label="Este mês" active={activeFilter === 'month'} onClick={setThisMonth} />
            </div>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 lg:space-y-8 lg:p-8 xl:p-10">

            {/* ── Row 1: Summary cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-7">
                <p className="text-sm font-medium text-muted-foreground lg:text-base">Total de vendas</p>
                <p className="mt-2 text-4xl font-bold tracking-tight lg:text-5xl">{filtered.length}</p>
                <p className="mt-1 text-xs text-muted-foreground/70 lg:text-sm">transações no período</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-7">
                <p className="text-sm font-medium text-muted-foreground lg:text-base">Faturamento</p>
                <p className="mt-2 truncate text-4xl font-bold tracking-tight text-emerald-600 lg:text-5xl dark:text-emerald-400">
                  {formatCurrency(revenue)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70 lg:text-sm">excluindo fiado</p>
              </div>
            </div>

            {/* ── Row 2: Payment breakdown + chart ──
                mobile  → stacked
                md+     → side by side
                xl+     → chart column wider
            ── */}
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6 lg:gap-8">

              {/* Payment method list */}
              <div className="flex-1 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:text-sm">
                  Por forma de pagamento
                </h3>
                <div className="space-y-2 lg:space-y-3">
                  {byMethod.map(({ method, count, total }) => {
                    const cfg = PAYMENT_CONFIG[method];
                    const barPct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;
                    return (
                      <div key={method}
                        className={`flex items-center gap-3 rounded-xl border border-border p-3 lg:p-4 ${cfg.bg}`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cfg.gradient} text-white shadow-sm lg:h-10 lg:w-10`}>
                          {cfg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium lg:text-base">{cfg.label}</span>
                            <span className={`shrink-0 text-sm font-bold lg:text-base ${cfg.color}`}>
                              {formatCurrency(total)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {count} venda{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Donut chart */}
              <div className="flex shrink-0 flex-col items-center justify-center gap-5 md:w-60 lg:w-72 xl:w-96">
                <DonutChart data={byMethod} />
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                  {byMethod.filter((d) => d.count > 0).map(({ method, count }) => (
                    <div key={method} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: PAYMENT_CONFIG[method].chartColor }} />
                      <span className="text-xs text-muted-foreground lg:text-sm">
                        {PAYMENT_CONFIG[method].label} ({count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Row 3: Sales list ──
                mobile  → cards
                md+     → table
            ── */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:mb-4 lg:text-sm">
                Vendas do período ({filtered.length})
              </h3>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
                  <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground lg:text-base">Nenhuma venda no período</p>
                  <p className="mt-1 text-xs text-muted-foreground/60 lg:text-sm">Ajuste o filtro de datas acima</p>
                </div>
              ) : (
                <>
                  {/* Mobile: card list */}
                  <div className="space-y-2 md:hidden">
                    {filtered.map((sale) => <SaleCard key={sale.id} sale={sale} />)}
                  </div>

                  {/* md+: table */}
                  <div className="hidden overflow-hidden rounded-xl border border-border md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          {['Data / hora', 'Itens', 'Pagamento'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:px-6 lg:py-4 lg:text-xs">
                              {h}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:px-6 lg:py-4">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((sale, i) => {
                          const cfg = PAYMENT_CONFIG[sale.paymentMethod];
                          return (
                            <tr key={sale.id}
                              className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}
                            >
                              <td className="px-4 py-3 text-sm text-muted-foreground lg:px-6 lg:py-4 lg:text-sm">
                                {new Date(sale.createdAt).toLocaleString('pt-BR', {
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                                })}
                              </td>
                              <td className="px-4 py-3 text-sm lg:px-6 lg:py-4">
                                {sale.items?.length ?? 0} item{(sale.items?.length ?? 0) !== 1 ? 's' : ''}
                              </td>
                              <td className="px-4 py-3 lg:px-6 lg:py-4">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                  {cfg.icon}{cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold lg:px-6 lg:py-4">
                                {formatCurrency(sale.total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
