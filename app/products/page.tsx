'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ProductList } from '@/features/products/components/ProductList';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProductStore } from '@/store/useProductStore';
import { ProductFormData } from '@/types/product';

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
          <Button onClick={() => setShowModal(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Produto
          </Button>
        }
      />

      <ProductFilters />

      {loadingState === 'loading' ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" className="text-blue-600" />
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
