'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usePageHeader } from '@/hooks/usePageHeader';
import { Button } from '@/components/ui/button';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { ImportProductsButton } from '@/components/ui/ImportProductsButton';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ProductList } from '@/features/products/components/ProductList';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProductStore } from '@/store/useProductStore';
import { ProductFormData } from '@/types/product';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { formatCurrency } from '@/utils/formatters';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const { fetchProducts, createProduct, getFilteredProducts, products, loadingState } = useProductStore();
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

  const HEADERS = ['Nome', 'Código de Barras', 'Categoria', 'Preço', 'Estoque', 'Estoque Mínimo'];

  function getRows() {
    return filtered.map((p) => [
      p.name,
      p.barcode || '—',
      p.category || '—',
      formatCurrency(p.price),
      p.stock,
      p.minStock,
    ]);
  }

  function handleExportExcel() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToExcel(`produtos-${date}`, HEADERS, getRows(), 'Produtos');
  }

  function handleExportPDF() {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    exportToPDF('Relatório de Produtos', HEADERS, getRows(), `produtos-${date}`, true);
  }

  usePageHeader({
    title: 'Produtos',
    subtitle: `${filtered.length} produto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`,
    actions: (
      <div className="flex items-center gap-2">
        <ExportMenu onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} disabled={products.length === 0} />
        <ImportProductsButton onSuccess={fetchProducts} />
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus />
          Novo Produto
        </Button>
      </div>
    ),
  });

  return (
    <div className="space-y-6">
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
