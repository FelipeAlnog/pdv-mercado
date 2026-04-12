'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Product, ProductFormData } from '@/types/product';
import { useProductStore } from '@/store/useProductStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductForm } from './ProductForm';
import { formatCurrency, formatDateShort } from '@/utils/formatters';
import { Pencil, Trash2, Package } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Tente ajustar os filtros ou cadastre um novo produto</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-white">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category}</p>
                <p className="mt-0.5 font-mono text-xs text-gray-400">{product.barcode}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(product)} aria-label="Editar">
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
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stockBadge(product)}
                <span className="text-xs text-gray-500">
                  <span className={product.stock <= product.minStock ? 'font-semibold text-red-600' : ''}>
                    {product.stock}
                  </span>
                  <span className="text-gray-400"> / {product.minStock} min</span>
                </span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Produto</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Código</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Preço</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wide">Estoque</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Cadastro</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {product.barcode}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      product.stock <= product.minStock
                        ? 'font-semibold text-destructive'
                        : 'font-semibold'
                    }
                  >
                    {product.stock}
                  </span>
                  <span className="text-xs text-muted-foreground"> / {product.minStock} min</span>
                </TableCell>
                <TableCell>{stockBadge(product)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateShort(product.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setEditing(product)}
                      aria-label="Editar"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleting(product)}
                      aria-label="Excluir"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
