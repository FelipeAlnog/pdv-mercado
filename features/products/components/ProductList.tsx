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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 dark:border-slate-700">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nenhum produto encontrado</p>
        <p className="mt-1 text-xs text-slate-400">Tente ajustar os filtros ou cadastre um novo produto</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Produto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Código
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Preço
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Estoque
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Cadastro
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{product.barcode}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`font-semibold ${
                        product.stock <= product.minStock
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {product.stock}
                    </span>
                    <span className="text-xs text-slate-400"> / {product.minStock} min</span>
                  </td>
                  <td className="px-4 py-3.5">{stockBadge(product)}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{formatDateShort(product.createdAt)}</td>
                  <td className="px-4 py-3.5">
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
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
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
      </div>

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
