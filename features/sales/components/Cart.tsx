'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { useSaleStore } from '@/store/useSaleStore';
import { useProductStore } from '@/store/useProductStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { CartItemRow } from './CartItemRow';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/formatters';
import { PaymentMethod } from '@/types/sale';
import { cn } from '@/lib/utils';
import { ShoppingCart, CheckCircle, Banknote, CreditCard, QrCode, Clock, Search, UserPlus, X } from 'lucide-react';

// ─── Payment method config (same palette as report) ──────────────────────────

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  active: string;
  inactive: string;
}[] = [
  {
    value: 'cash',
    label: 'Dinheiro',
    icon: <Banknote className="h-3.5 w-3.5" />,
    active: 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-400',
    inactive: 'border-border text-foreground hover:border-emerald-400/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10',
  },
  {
    value: 'card',
    label: 'Cartão',
    icon: <CreditCard className="h-3.5 w-3.5" />,
    active: 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-400',
    inactive: 'border-border text-foreground hover:border-blue-400/60 hover:bg-blue-50/50 dark:hover:bg-blue-500/10',
  },
  {
    value: 'pix',
    label: 'Pix',
    icon: <QrCode className="h-3.5 w-3.5" />,
    active: 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-400',
    inactive: 'border-border text-foreground hover:border-violet-400/60 hover:bg-violet-50/50 dark:hover:bg-violet-500/10',
  },
  {
    value: 'pending',
    label: 'Fiado',
    icon: <Clock className="h-3.5 w-3.5" />,
    active: 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm dark:bg-amber-500/15 dark:text-amber-400',
    inactive: 'border-border text-foreground hover:border-amber-400/60 hover:bg-amber-50/50 dark:hover:bg-amber-500/10',
  },
];

const QUICK_AMOUNTS = [10, 20, 50, 100];

// ─── Cash change calculator ───────────────────────────────────────────────────

function CashCalculator({ total }: { total: number }) {
  const [received, setReceived] = useState('');

  const numericReceived = parseFloat(received.replace(',', '.')) || 0;
  const change = numericReceived - total;
  const hasValue = received !== '' && numericReceived > 0;

  return (
    <div className="space-y-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-800/40 dark:bg-emerald-500/10">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        Calculadora de Troco
      </p>

      {/* Quick amount buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => setReceived(String(amount))}
            className={cn(
              'rounded-lg border py-1.5 text-xs font-semibold transition-all duration-200',
              numericReceived === amount
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-800/30'
            )}
          >
            R${amount}
          </button>
        ))}
      </div>

      {/* Received input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
          R$
        </span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={received}
          onChange={(e) => setReceived(e.target.value)}
          placeholder="0,00"
          className="w-full rounded-lg border border-emerald-300 bg-white py-2 pl-8 pr-3 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-white dark:focus:ring-emerald-800/40"
        />
      </div>

      {/* Change result */}
      {hasValue && (
        <div className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
          change >= 0
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400'
        )}>
          <span>{change >= 0 ? 'Troco' : 'Faltam'}</span>
          <span>{formatCurrency(Math.abs(change))}</span>
        </div>
      )}
    </div>
  );
}

// ─── Customer search for "fiado" ─────────────────────────────────────────────

function CustomerSearch() {
  const {
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerId, setCustomerId,
    dueDate, setDueDate,
  } = useCartStore();
  const { customers, fetchCustomers, loadingState } = useCustomerStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadingState === 'idle') fetchCustomers();
  }, [loadingState, fetchCustomers]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const matches = query.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone?.includes(query),
      ).slice(0, 6)
    : [];

  function selectCustomer(c: { id: string; name: string; phone?: string }) {
    setCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone ?? '');
    setQuery(c.name);
    setOpen(false);
  }

  function clearSelection() {
    setCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setQuery('');
  }

  const isLinked = !!customerId;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
        Cliente (Fiado)
      </p>

      {/* Search / linked display */}
      <div ref={ref} className="relative">
        {isLinked ? (
          <div className="flex items-center justify-between rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 dark:border-amber-700 dark:bg-amber-900/20">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{customerName}</p>
              {customerPhone && <p className="text-xs text-gray-500">{customerPhone}</p>}
            </div>
            <button onClick={clearSelection} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCustomerName(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder="Buscar cliente cadastrado..."
                className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-amber-700 dark:bg-amber-900/20 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {open && (query.trim() || matches.length > 0) && (
              <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                {matches.length > 0 ? (
                  matches.map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={() => selectCustomer(c)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                        {c.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                      </div>
                    </button>
                  ))
                ) : query.trim() ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                    <UserPlus className="h-4 w-4" />
                    <span>
                      Vender para <strong>&quot;{query}&quot;</strong> como novo cliente
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {/* Manual phone (only if not linked) */}
      {!isLinked && (
        <input
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="WhatsApp (ex: 11 99999-9999)"
          className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-amber-700 dark:bg-amber-900/20 dark:text-white dark:placeholder-gray-500"
        />
      )}

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-amber-700 dark:bg-amber-900/20 dark:text-white dark:[color-scheme:dark]"
      />
      <p className="text-xs text-amber-600 dark:text-amber-500">Data limite de pagamento</p>
    </div>
  );
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function Cart() {
  const {
    items, paymentMethod, setPaymentMethod,
    customerName,
    customerId,
    dueDate,
    customerPhone,
    getTotal, clearCart,
  } = useCartStore();
  const { createSale } = useSaleStore();
  const { fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(false);

  const total = getTotal();
  const isPending = paymentMethod === 'pending';
  const isCash = paymentMethod === 'cash';
  const itemCount = items.reduce((a, i) => a + i.quantity, 0);

  async function handleFinalizeSale() {
    if (items.length === 0) {
      toast.error('Adicione produtos antes de finalizar a venda.');
      return;
    }
    if (isPending && !customerName.trim()) {
      toast.error('Informe o nome do cliente para venda a receber.');
      return;
    }
    setLoading(true);
    try {
      await createSale({
        items: items.map(({ product: _, ...item }) => item),
        total,
        paymentMethod,
        ...(isPending && {
          customerName: customerName.trim(),
          ...(customerPhone.trim() && { customerPhone: customerPhone.trim() }),
          ...(dueDate && { dueDate }),
          ...(customerId && { customerId }),
        }),
      });
      await fetchProducts();
      toast.success('Venda finalizada com sucesso!');
      clearCart();
    } catch {
      toast.error('Erro ao finalizar venda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Carrinho</span>
          {items.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            Limpar
          </button>
        )}
      </div>

      <Separator />

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Carrinho vazio</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Escaneie um código de barras para adicionar
            </p>
          </div>
        ) : (
          items.map((item) => <CartItemRow key={item.productId} item={item} />)
        )}
      </div>

      <Separator />

      {/* Footer */}
      <div className="shrink-0 p-4 space-y-3">

        {/* Payment method */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Forma de Pagamento
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all duration-200',
                  paymentMethod === m.value ? m.active : m.inactive
                )}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cash change calculator */}
        {isCash && <CashCalculator total={total} />}

        {/* Customer fields — only for pending */}
        {isPending && <CustomerSearch />}

        {/* Total */}
        <div className="rounded-xl bg-gradient-to-br from-primary to-violet-600 p-4 text-primary-foreground">
          <div className="mb-2 flex items-center justify-between text-sm opacity-80">
            <span>Subtotal ({itemCount} un)</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm font-medium opacity-90">Total</span>
            <span className="text-3xl font-bold tracking-tight">{formatCurrency(total)}</span>
          </div>
        </div>

        <Button
          onClick={handleFinalizeSale}
          loading={loading}
          disabled={items.length === 0}
          size="lg"
          className="w-full"
        >
          <CheckCircle className="h-5 w-5" />
          Finalizar Venda
        </Button>
      </div>
    </div>
  );
}
