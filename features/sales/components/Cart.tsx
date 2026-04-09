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
          <div className="grid grid-cols-3 gap-1.5">
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
