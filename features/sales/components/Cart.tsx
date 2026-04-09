'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { useSaleStore } from '@/store/useSaleStore';
import { useProductStore } from '@/store/useProductStore';
import { CartItemRow } from './CartItemRow';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { PAYMENT_METHODS } from '@/utils/constants';
import { PaymentMethod } from '@/types/sale';
import { cn } from '@/utils/cn';

export function Cart() {
  const { items, paymentMethod, setPaymentMethod, getTotal, clearCart } = useCartStore();
  const { createSale } = useSaleStore();
  const { fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(false);
  const total = getTotal();
  const itemCount = items.reduce((a, i) => a + i.quantity, 0);

  async function handleFinalizeSale() {
    if (items.length === 0) {
      toast.error('Adicione produtos antes de finalizar a venda.');
      return;
    }
    setLoading(true);
    try {
      await createSale({
        items: items.map(({ product: _, ...item }) => item),
        total,
        paymentMethod,
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-white">Carrinho</h2>
          {items.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {items.length}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-red-500 transition-colors hover:text-red-600"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">Carrinho vazio</p>
            <p className="mt-1 text-xs text-slate-400">Escaneie um código de barras para adicionar</p>
          </div>
        ) : (
          items.map((item) => <CartItemRow key={item.productId} item={item} />)
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 p-4 space-y-3 dark:border-slate-800">
        {/* Payment method */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Forma de Pagamento
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value as PaymentMethod)}
                className={cn(
                  'rounded-lg border py-2 text-xs font-semibold transition-all duration-200',
                  paymentMethod === m.value
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-600'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-sm shadow-indigo-500/25">
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
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Finalizar Venda
        </Button>
      </div>
    </div>
  );
}
