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
    <div className="space-y-4">
      <Header
        title="Vendas"
        subtitle="PDV — Ponto de Venda"
        actions={
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setActiveTab('pdv')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'pdv' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              PDV
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400'}`}
            >
              Histórico
            </button>
          </div>
        }
      />

      {activeTab === 'pdv' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wide">
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
              <Spinner size="lg" className="text-blue-600" />
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
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Código <span className="font-mono font-semibold">{quickBarcode}</span> não encontrado no catálogo.
                Preencha os dados abaixo para cadastrar.
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
