'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductFormData } from '@/types/product';
import { useProductStore } from '@/store/useProductStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
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
import { STAGGER_CONTAINER, STAGGER_ITEM, SCALE_IN } from '@/lib/motion';

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { updateProduct, deleteProduct } = useProductStore();
  const [editing, setEditing]             = useState<Product | null>(null);
  const [deleting, setDeleting]           = useState<Product | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever the filtered set changes
  const filterKey = products.map((p) => p.id).join(',');
  useEffect(() => { setPage(1); }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = products.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function handleUpdate(data: ProductFormData) {
    if (!editing) return;
    setLoadingAction(true);
    try {
      await updateProduct(editing.id, data);
      toast.success('Produto atualizado com sucesso!');
      setEditing(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar produto.';
      toast.error(message);
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
    if (product.stock === 0)               return <Badge variant="danger">Sem estoque</Badge>;
    if (product.stock <= product.minStock) return <Badge variant="warning">Baixo estoque</Badge>;
    return <Badge variant="success">Em estoque</Badge>;
  }

  if (products.length === 0) {
    return (
      <motion.div
        variants={SCALE_IN}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16"
      >
        <motion.div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Package className="h-7 w-7 text-muted-foreground" />
        </motion.div>
        <p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Tente ajustar os filtros ou cadastre um novo produto
        </p>
      </motion.div>
    );
  }

  return (
    <>
      {/* ── Mobile card view ─────────────────────────────────────────────── */}
      <motion.div
        className="space-y-3 md:hidden"
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence initial={false}>
          {paginated.map((product) => (
            <motion.div
              key={product.id}
              variants={STAGGER_ITEM}
              layout
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
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
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(product)}
                    aria-label="Excluir"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
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
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* ── Desktop table view ───────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
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
            <AnimatePresence initial={false}>
              {paginated.map((product, idx) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.18, delay: Math.min(idx * 0.03, 0.25) }}
                  layout
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.barcode || '—'}
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
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <Pagination
        total={products.length}
        page={safePage}
        pageSize={pageSize}
        onPage={setPage}
        onPageSize={setPageSize}
      />

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar produto" size="lg" locked>
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
