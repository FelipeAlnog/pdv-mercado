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

export function Cart() {
  const { items, paymentMethod, setPaymentMethod, customerName, setCustomerName, customerPhone, setCustomerPhone, dueDate, setDueDate, getTotal, clearCart } = useCartStore();
  const { createSale } = useSaleStore();
  const { fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(false);
  const total = getTotal();
  const isPending = paymentMethod === 'pending';

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
      // Sincroniza o estoque no store após a venda decrementar no mockDb
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
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Carrinho
          {items.length > 0 && (
            <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              {items.length}
            </span>
          )}
        </h2>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:underline"
          >
            Limpar tudo
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm text-gray-500">Nenhum item no carrinho</p>
            <p className="text-xs text-gray-400 mt-1">Escaneie um código de barras para adicionar</p>
          </div>
        ) : (
          items.map((item) => <CartItemRow key={item.productId} item={item} />)
        )}
      </div>

      {/* Payment & Total */}
      <div className="border-t border-gray-200 p-4 space-y-4 dark:border-gray-700">
        {/* Payment method */}
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Pagamento</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPaymentMethod(m.value as PaymentMethod)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  paymentMethod === m.value
                    ? m.value === 'pending'
                      ? 'border-yellow-500 bg-yellow-500 text-white'
                      : 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 dark:border-gray-600 dark:text-gray-400'
                }`}
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
        <div className="rounded-xl bg-blue-600 p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-80">Itens</span>
            <span className="text-sm">{items.reduce((a, i) => a + i.quantity, 0)} un</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Total</span>
            <span className="text-3xl font-bold">{formatCurrency(total)}</span>
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
