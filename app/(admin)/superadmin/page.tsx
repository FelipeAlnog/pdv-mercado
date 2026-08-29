'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { STAGGER_CONTAINER, EASE_OUT } from '@/lib/motion';
import {
  Users,
  ShoppingCart,
  Package,
  Pencil,
  Crown,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  UserX,
  Store,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Plan = 'FREE' | 'PRO';
type StatusFilter = 'all' | 'active' | 'inactive';

type UserStore = {
  id: string;
  name: string;
  plan: Plan;
  planExpiresAt: string | null;
  createdAt: string;
  _count: { sales: number; product: number; customers: number };
} | null;

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  store: UserStore;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isPlanExpired(planExpiresAt: string | null) {
  if (!planExpiresAt) return false;
  return new Date(planExpiresAt) < new Date();
}

/**
 * Um cliente é considerado ATIVO se:
 * - Tem loja cadastrada
 * - E plano FREE (sem expiração), ou PRO com data de expiração futura ou sem data
 */
function isClientActive(user: AdminUser): boolean {
  if (!user.store) return false;
  if (user.store.plan === 'FREE') return true;
  // PRO: ativo se não tiver data definida ou se a data ainda não expirou
  return !isPlanExpired(user.store.planExpiresAt);
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── Edit Dialog ─────────────────────────────────────────────────────────────

type EditDialogProps = {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSaved: (userId: string, plan: Plan, planExpiresAt: string | null) => void;
};

function EditPlanDialog({ user, open, onClose, onSaved }: EditDialogProps) {
  const [plan, setPlan] = useState<Plan>(user.store?.plan ?? 'FREE');
  const [expiresAt, setExpiresAt] = useState<string>(
    toDateInputValue(user.store?.planExpiresAt ?? null),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPlan(user.store?.plan ?? 'FREE');
      setExpiresAt(toDateInputValue(user.store?.planExpiresAt ?? null));
    }
  }, [open, user]);

  async function handleSave() {
    setSaving(true);
    try {
      const planExpiresAt = expiresAt
        ? new Date(expiresAt + 'T23:59:59.000Z').toISOString()
        : null;

      const res = await fetch(`/api/admin/users/${user.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, planExpiresAt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erro ao salvar.');
      }

      onSaved(user.id, plan, planExpiresAt);
      toast.success('Assinatura atualizada com sucesso.');
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Assinatura do Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client info */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {user.store && (
                <p className="text-xs text-muted-foreground">
                  Loja: <span className="font-medium text-foreground">{user.store.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Plan selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Plano</label>
            <div className="flex gap-2">
              {(['FREE', 'PRO'] as Plan[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={[
                    'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                    plan === p
                      ? p === 'PRO'
                        ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-400'
                        : 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80',
                  ].join(' ')}
                >
                  {p === 'PRO' && <Crown className="h-4 w-4" />}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Expiry date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Data de expiração da assinatura
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {expiresAt && (
              <button
                type="button"
                onClick={() => setExpiresAt('')}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Remover data de expiração
              </button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Spinner size="sm" className="mr-2" />}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color = 'primary',
  onClick,
  active,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'emerald' | 'red' | 'violet';
  onClick?: () => void;
  active?: boolean;
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-500/10 text-red-600 dark:text-red-400',
    violet:  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all text-left',
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : 'cursor-default',
        active ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border',
      ].join(' ')}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const [users, setUsers]             = useState<AdminUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editUser, setEditUser]       = useState<AdminUser | null>(null);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error('Não foi possível carregar os clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSaved(userId: string, plan: Plan, planExpiresAt: string | null) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId && u.store
          ? { ...u, store: { ...u.store, plan, planExpiresAt } }
          : u,
      ),
    );
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalClients    = users.length;
  const activeClients   = users.filter(isClientActive).length;
  const inactiveClients = users.filter((u) => !isClientActive(u)).length;
  const proClients      = users.filter((u) => u.store?.plan === 'PRO' && !isPlanExpired(u.store.planExpiresAt)).length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.store?.name ?? '').toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isClientActive(u)) ||
        (statusFilter === 'inactive' && !isClientActive(u));

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Gerenciamento de Clientes</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie todos os clientes do sistema
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={['h-4 w-4', loading ? 'animate-spin' : ''].join(' ')} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl space-y-6 p-6">
        {loading && users.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
            >
              <StatCard
                label="Total de clientes"
                value={totalClients}
                icon={<Users className="h-5 w-5" />}
                color="primary"
                onClick={() => setStatusFilter('all')}
                active={statusFilter === 'all'}
              />
              <StatCard
                label="Clientes ativos"
                value={activeClients}
                icon={<CheckCircle2 className="h-5 w-5" />}
                color="emerald"
                onClick={() => setStatusFilter('active')}
                active={statusFilter === 'active'}
              />
              <StatCard
                label="Clientes inativos"
                value={inactiveClients}
                icon={<XCircle className="h-5 w-5" />}
                color="red"
                onClick={() => setStatusFilter('inactive')}
                active={statusFilter === 'inactive'}
              />
              <StatCard
                label="Assinaturas PRO"
                value={proClients}
                icon={<Crown className="h-5 w-5" />}
                color="violet"
              />
            </motion.div>

            {/* Search + filters */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...EASE_OUT, delay: 0.15 }}
            >
              {/* Search */}
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou loja…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background py-1 pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Status tabs */}
              <div className="flex rounded-lg border border-border bg-muted/40 p-1 text-sm">
                {([
                  { key: 'all',      label: 'Todos' },
                  { key: 'active',   label: 'Ativos' },
                  { key: 'inactive', label: 'Inativos' },
                ] as { key: StatusFilter; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={[
                      'rounded-md px-3 py-1 font-medium transition-all',
                      statusFilter === key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...EASE_OUT, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Exibindo <span className="font-semibold text-foreground">{filtered.length}</span> de{' '}
                  <span className="font-semibold text-foreground">{totalClients}</span> cliente{totalClients !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Expira em</TableHead>
                      <TableHead className="text-center">Vendas</TableHead>
                      <TableHead className="text-center">Produtos</TableHead>
                      <TableHead className="text-center">Clientes</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <UserX className="h-8 w-8 opacity-40" />
                            <p className="text-sm">Nenhum cliente encontrado.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((user) => {
                        const active  = isClientActive(user);
                        const expired = user.store ? isPlanExpired(user.store.planExpiresAt) : false;

                        return (
                          <TableRow key={user.id}>
                            {/* Client */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {getInitials(user.name)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium leading-tight">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Store */}
                            <TableCell>
                              {user.store ? (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                  {user.store.name}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sem loja</span>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                              <Badge variant={active ? 'success' : 'danger'}>
                                {active ? (
                                  <><CheckCircle2 className="h-3 w-3" /> Ativo</>
                                ) : (
                                  <><XCircle className="h-3 w-3" /> Inativo</>
                                )}
                              </Badge>
                            </TableCell>

                            {/* Plan */}
                            <TableCell>
                              {user.store ? (
                                <Badge
                                  variant={user.store.plan === 'PRO' ? 'default' : 'secondary'}
                                  className={
                                    user.store.plan === 'PRO'
                                      ? 'bg-violet-500/10 text-violet-700 dark:text-violet-400'
                                      : ''
                                  }
                                >
                                  {user.store.plan === 'PRO' && <Crown className="h-3 w-3" />}
                                  {user.store.plan}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Expires */}
                            <TableCell>
                              {user.store?.planExpiresAt ? (
                                <span className={['text-sm', expired ? 'text-red-600 dark:text-red-400 font-medium' : ''].join(' ')}>
                                  {formatDate(user.store.planExpiresAt)}
                                  {expired && (
                                    <span className="ml-1.5 rounded bg-red-50 px-1 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                      EXPIRADO
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>

                            {/* Counts */}
                            <TableCell className="text-center text-sm">
                              {user.store ? (
                                <span className="flex items-center justify-center gap-1">
                                  <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                                  {user.store._count.sales}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {user.store ? (
                                <span className="flex items-center justify-center gap-1">
                                  <Package className="h-3 w-3 text-muted-foreground" />
                                  {user.store._count.product}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {user.store ? (
                                <span className="flex items-center justify-center gap-1">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  {user.store._count.customers}
                                </span>
                              ) : '—'}
                            </TableCell>

                            {/* Registered */}
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </TableCell>

                            {/* Action */}
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => setEditUser(user)}
                                disabled={!user.store}
                                title={!user.store ? 'Usuário sem loja' : 'Editar assinatura'}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Edit dialog */}
      {editUser && (
        <EditPlanDialog
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
