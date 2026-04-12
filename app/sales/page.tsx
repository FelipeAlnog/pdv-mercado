'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { BarcodeInput } from '@/features/sales/components/BarcodeInput';
import { Cart } from '@/features/sales/components/Cart';
import { SaleHistory } from '@/features/sales/components/SaleHistory';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { useSaleStore } from '@/store/useSaleStore';
import { Product, ProductFormData } from '@/types/product';
import { cn } from '@/lib/utils';

export default function SalesPage() {
  const { fetchProducts, createProduct } = useProductStore();
  const { addItem } = useCartStore();
  const { sales, loadingState, fetchSales } = useSaleStore();
  const [activeTab, setActiveTab] = useState<'pdv' | 'history'>('pdv');
  const [quickBarcode, setQuickBarcode] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  function handleProductFound(product: Product) {
    if (product.stock <= 0) {
      toast.error(`${product.name} está sem estoque!`);
      return;
    }
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho`);
  }

  async function handleQuickCreate(data: ProductFormData) {
    setQuickLoading(true);
    try {
      const product = await createProduct(data);
      toast.success('Produto cadastrado e adicionado ao carrinho!');
      addItem(product);
      setQuickBarcode(null);
    } catch {
      toast.error('Erro ao cadastrar produto.');
    } finally {
      setQuickLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Header
        title="Vendas"
        subtitle="PDV — Ponto de Venda"
        actions={
          <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            {(['pdv', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {tab === 'pdv' ? 'PDV' : 'Histórico'}
              </button>
            ))}
          </div>
        }
      />

      {activeTab === 'pdv' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Scanner */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Escanear Produto
              </p>
              <BarcodeInput
                onProductFound={handleProductFound}
                onNotFound={(barcode) => setQuickBarcode(barcode)}
              />
            </div>
          </div>

          <div className="h-[420px] lg:h-[calc(100vh-12rem)]">
            <Cart />
          </div>
        </div>
      ) : (
        <div>
          {loadingState === 'loading' ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" className="text-primary" />
            </div>
          ) : (
            <SaleHistory sales={sales} />
          )}
        </div>
      )}

      <Modal
        open={!!quickBarcode}
        onClose={() => setQuickBarcode(null)}
        title="Produto não encontrado — Cadastrar rapidamente"
        size="lg"
      >
        {quickBarcode && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-500/10">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Código{' '}
                <span className="font-mono font-semibold">{quickBarcode}</span>{' '}
                não encontrado no catálogo. Preencha os dados abaixo para cadastrar.
              </p>
            </div>
            <ProductForm
              prefillBarcode={quickBarcode}
              onSubmit={handleQuickCreate}
              onCancel={() => setQuickBarcode(null)}
              loading={quickLoading}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
