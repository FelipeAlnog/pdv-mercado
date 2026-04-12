'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { useSaleStore } from '@/store/useSaleStore';
import { useProductStore } from '@/store/useProductStore';
import { CartItemRow } from './CartItemRow';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';
import { PaymentMethod } from '@/types/sale';
import { cn } from '@/lib/utils';
import { ShoppingCart, CheckCircle } from 'lucide-react';

export function Cart() {
  const { items, paymentMethod, setPaymentMethod, customerName, setCustomerName, customerPhone, setCustomerPhone, dueDate, setDueDate, getTotal, clearCart } = useCartStore();
  const { createSale } = useSaleStore();
  const { fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(false);
  const total = getTotal();
  const isPending = paymentMethod === 'pending';
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
                onClick={() => setPaymentMethod(m.value as PaymentMethod)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-semibold transition-all duration-200',
                  paymentMethod === m.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground hover:border-primary/50 hover:text-primary'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer fields — only for pending */}
        {isPending && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Cliente</p>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do cliente *"
              className="w-full rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-white dark:placeholder-gray-500"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="WhatsApp (ex: 11 99999-9999)"
              className="w-full rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-white dark:placeholder-gray-500"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-white dark:[color-scheme:dark]"
            />
            <p className="text-xs text-yellow-600 dark:text-yellow-500">Data limite de pagamento</p>
          </div>
        )}

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
