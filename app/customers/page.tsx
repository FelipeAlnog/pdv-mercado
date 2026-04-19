'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { CustomerList } from '@/features/customers/components/CustomerList';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useSaleStore } from '@/store/useSaleStore';
import { CustomerFormData } from '@/types/customer';
import { UserPlus, Users, AlertTriangle, DollarSign, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'debtors' | 'overdue';

export default function CustomersPage() {
  const { customers, loadingState, fetchCustomers, createCustomer } = useCustomerStore();
  const { sales, fetchSales } = useSaleStore();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetchCustomers();
    fetchSales();
  }, [fetchCustomers, fetchSales]);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const pendingSales = useMemo(
    () => sales.filter((s) => s.paymentMethod === 'pending' && !s.paidAt),
    [sales],
  );

  const totalDebt = useMemo(
    () => pendingSales.reduce((acc, s) => acc + s.total, 0),
    [pendingSales],
  );

  const overdueCount = useMemo(() => {
    const now = new Date();
    const overdueCids = new Set(
      pendingSales
        .filter((s) => s.dueDate && new Date(s.dueDate) < now && s.customerId)
        .map((s) => s.customerId),
    );
    return overdueCids.size;
  }, [pendingSales]);

  const debtorIds = useMemo(() => {
    return new Set(pendingSales.filter((s) => s.customerId).map((s) => s.customerId));
  }, [pendingSales]);

  const overdueIds = useMemo(() => {
    const now = new Date();
    return new Set(
      pendingSales
        .filter((s) => s.dueDate && new Date(s.dueDate) < now && s.customerId)
        .map((s) => s.customerId),
    );
  }, [pendingSales]);

  // ── Filtered list ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = customers;
    if (filter === 'debtors') list = list.filter((c) => debtorIds.has(c.id));
    if (filter === 'overdue') list = list.filter((c) => overdueIds.has(c.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.cpf?.replace(/\D/g, '').includes(q.replace(/\D/g, '')),
      );
    }
    return list;
  }, [customers, filter, search, debtorIds, overdueIds]);

  async function handleCreate(data: CustomerFormData) {
    setCreating(true);
    try {
      await createCustomer(data);
      toast.success('Cliente cadastrado com sucesso!');
      setShowCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    } finally {
      setCreating(false);
    }
  }

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'debtors', label: 'Com fiado' },
    { value: 'overdue', label: 'Inadimplentes' },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Clientes"
        subtitle="Cadastro e controle de clientes"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <UserPlus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{customers.length}</p>
            <p className="text-xs text-muted-foreground">Total de clientes</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800/40 dark:bg-amber-500/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
            <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(totalDebt)}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Fiado em aberto</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-800/40 dark:bg-red-500/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{overdueCount}</p>
            <p className="text-xs text-red-600 dark:text-red-500">Inadimplentes</p>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou CPF..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loadingState === 'loading' ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : (
        <CustomerList customers={filtered} />
      )}

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Novo cliente"
        size="lg"
      >
        <CustomerForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
