'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ProductList } from '@/features/products/components/ProductList';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProductStore } from '@/store/useProductStore';
import { ProductFormData } from '@/types/product';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const { fetchProducts, createProduct, getFilteredProducts, loadingState } = useProductStore();
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleCreate(data: ProductFormData) {
    setCreating(true);
    try {
      await createProduct(data);
      toast.success('Produto cadastrado com sucesso!');
      setShowModal(false);
    } catch {
      toast.error('Erro ao cadastrar produto.');
    } finally {
      setCreating(false);
    }
  }

  const filtered = getFilteredProducts();

  return (
    <div className="space-y-6">
      <Header
        title="Produtos"
        subtitle={`${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus />
            Novo Produto
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <ProductFilters />
      </div>

      {loadingState === 'loading' ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : (
        <ProductList products={filtered} />
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Produto" size="lg">
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setShowModal(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
