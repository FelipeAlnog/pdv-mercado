'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Product, ProductFormData } from '@/types/product';
import { useProductStore } from '@/store/useProductStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductForm } from './ProductForm';
import { formatCurrency, formatDateShort } from '@/utils/formatters';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { updateProduct, deleteProduct } = useProductStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  async function handleUpdate(data: ProductFormData) {
    if (!editing) return;
    setLoadingAction(true);
    try {
      await updateProduct(editing.id, data);
      toast.success('Produto atualizado com sucesso!');
      setEditing(null);
    } catch {
      toast.error('Erro ao atualizar produto.');
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoadingAction(true);
    try {
      await deleteProduct(deleting.id);
      toast.success('Produto excluído com sucesso!');
      setDeleting(null);
    } catch {
      toast.error('Erro ao excluir produto.');
    } finally {
      setLoadingAction(false);
    }
  }

  function stockBadge(product: Product) {
    if (product.stock === 0) return <Badge variant="danger">Sem estoque</Badge>;
    if (product.stock <= product.minStock) return <Badge variant="warning">Baixo estoque</Badge>;
    return <Badge variant="success">Em estoque</Badge>;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-600">
        <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Nenhum produto encontrado</p>
        <p className="text-xs text-gray-400">Tente ajustar os filtros ou cadastre um novo produto</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Produto</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Código</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Preço</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">Estoque</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Cadastro</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {products.map((product) => (
              <tr
                key={product.id}
                className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.barcode}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {product.stock}
                  </span>
                  <span className="text-xs text-gray-400"> / {product.minStock} min</span>
                </td>
                <td className="px-4 py-3">{stockBadge(product)}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDateShort(product.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(product)}
                      aria-label="Editar"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(product)}
                      aria-label="Excluir"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar produto" size="lg">
        {editing && (
          <ProductForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            loading={loadingAction}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${deleting?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={loadingAction}
      />
    </>
  );
}
