'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Customer, CustomerFormData } from '@/types/customer';
import { Sale } from '@/types/sale';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useSaleStore } from '@/store/useSaleStore';
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
import { CustomerForm } from './CustomerForm';
import { formatCurrency, formatDateShort } from '@/utils/formatters';
import { Pencil, Trash2, Users, Phone, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function CustomerDebtDetail({ sales }: { sales: Sale[] }) {
  const pending = sales.filter((s) => s.paymentMethod === 'pending' && !s.paidAt);
  const paid = sales.filter((s) => s.paymentMethod === 'pending' && s.paidAt);

  if (sales.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nenhuma venda fiada registrada.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Em aberto ({pending.length})
          </p>
          <div className="space-y-1.5">
            {pending.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800/40 dark:bg-amber-500/10"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-muted-foreground">{formatDateShort(s.createdAt)}</span>
                  {s.dueDate && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      vence {formatDateShort(s.dueDate)}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {formatCurrency(s.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {paid.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Pagos ({paid.length})
          </p>
          <div className="space-y-1.5">
            {paid.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-800/40 dark:bg-emerald-500/10"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground">{formatDateShort(s.createdAt)}</span>
                </div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(s.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomerList({ customers }: CustomerListProps) {
  const { updateCustomer, deleteCustomer } = useCustomerStore();
  const { sales } = useSaleStore();
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  function getCustomerSales(customerId: string): Sale[] {
    return sales.filter((s) => s.customerId === customerId && s.paymentMethod === 'pending');
  }

  function getPendingDebt(customerId: string): number {
    return getCustomerSales(customerId)
      .filter((s) => !s.paidAt)
      .reduce((acc, s) => acc + s.total, 0);
  }

  function isOverdue(customerId: string): boolean {
    const now = new Date();
    return getCustomerSales(customerId).some(
      (s) => !s.paidAt && s.dueDate && new Date(s.dueDate) < now,
    );
  }

  function statusBadge(customerId: string) {
    const debt = getPendingDebt(customerId);
    if (debt === 0) return <Badge variant="success">Regular</Badge>;
    if (isOverdue(customerId)) return <Badge variant="danger">Inadimplente</Badge>;
    return <Badge variant="warning">Fiado em aberto</Badge>;
  }

  async function handleUpdate(data: CustomerFormData) {
    if (!editing) return;
    setLoadingAction(true);
    try {
      await updateCustomer(editing.id, data);
      toast.success('Cliente atualizado com sucesso!');
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar cliente.');
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoadingAction(true);
    try {
      await deleteCustomer(deleting.id);
      toast.success('Cliente excluído com sucesso!');
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir cliente.');
    } finally {
      setLoadingAction(false);
    }
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Nenhum cliente encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Cadastre um novo cliente ou ajuste o filtro
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {customers.map((customer) => {
          const debt = getPendingDebt(customer.id);
          const customerSales = getCustomerSales(customer.id);
          const isOpen = expanded === customer.id;
          return (
            <div
              key={customer.id}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                  {getInitials(customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{customer.name}</p>
                    {statusBadge(customer.id)}
                  </div>
                  {customer.phone && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                  {debt > 0 && (
                    <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                      Fiado: {formatCurrency(debt)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(customer)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(customer)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {customerSales.length > 0 && (
                <>
                  <button
                    onClick={() => setExpanded(isOpen ? null : customer.id)}
                    className="flex w-full items-center justify-between border-t border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40"
                  >
                    <span>Histórico de fiado ({customerSales.length})</span>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      <CustomerDebtDetail sales={customerSales} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Cliente</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Contato</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">CPF</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Fiado em aberto</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Cadastro</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {
              const debt = getPendingDebt(customer.id);
              const customerSales = getCustomerSales(customer.id);
              const isOpen = expanded === customer.id;
              const overdue = isOverdue(customer.id);

              return (
                <React.Fragment key={customer.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => customerSales.length > 0 && setExpanded(isOpen ? null : customer.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          {customer.address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{customer.address}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {customer.cpf || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {debt > 0 ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {overdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                          <span className={debt > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>
                            {formatCurrency(debt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(customer.id)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateShort(customer.createdAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {customerSales.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setExpanded(isOpen ? null : customer.id)}
                            aria-label="Ver histórico"
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditing(customer)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleting(customer)}
                          aria-label="Excluir"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isOpen && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="bg-muted/30 px-6 pb-4 pt-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Histórico de fiado — {customer.name}
                        </p>
                        <CustomerDebtDetail sales={customerSales} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar cliente" size="lg">
        {editing && (
          <CustomerForm
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
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir "${deleting?.name}"? Vendas associadas não serão excluídas.`}
        confirmLabel="Excluir"
        loading={loadingAction}
      />
    </>
  );
}
