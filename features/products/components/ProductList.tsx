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
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
