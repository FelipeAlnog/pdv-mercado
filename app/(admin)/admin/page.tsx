'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { Users, Store, ShoppingCart, Package, Pencil, Crown, RefreshCw } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

type Plan = 'FREE' | 'PRO';

type UserStore = {
  id: string;
  name: string;
  plan: Plan;
  planExpiresAt: string | null;
  createdAt: string;
  _count: { sales: number; products: number; customers: number };
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

function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10); // YYYY-MM-DD
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
      toast.success('Plano atualizado com sucesso.');
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
          <DialogTitle>Editar Assinatura</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User info */}
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.store && (
              <p className="mt-1 text-xs text-muted-foreground">
                Loja: <span className="font-medium text-foreground">{user.store.name}</span>
              </p>
            )}
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
              Data de expiração
              {plan === 'FREE' && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">(opcional no FREE)</span>
              )}
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            {saving ? <Spinner size="sm" className="mr-2" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stats Card ──────────────────────────────────────────────────────────────

function AdminStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Erro ao carregar usuários.');
      const data: AdminUser[] = await res.json();
      setUsers(data);
    } catch {
      toast.error('Não foi possível carregar os usuários.');
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

  const totalUsers   = users.length;
  const proUsers     = users.filter((u) => u.store?.plan === 'PRO').length;
  const activeStores = users.filter((u) => u.store).length;
  const expiredPro   = users.filter(
    (u) => u.store?.plan === 'PRO' && isPlanExpired(u.store.planExpiresAt),
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gerenciamento de usuários e assinaturas</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={['h-4 w-4', loading ? 'animate-spin' : ''].join(' ')} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl space-y-8 p-6">
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
              <AdminStat label="Total de usuários" value={totalUsers} icon={<Users className="h-5 w-5" />} />
              <AdminStat label="Lojas ativas" value={activeStores} icon={<Store className="h-5 w-5" />} />
              <AdminStat label="Assinaturas PRO" value={proUsers} icon={<Crown className="h-5 w-5" />} />
              <AdminStat label="PRO expirados" value={expiredPro} icon={<Package className="h-5 w-5" />} />
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...EASE_OUT, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-semibold">Usuários cadastrados</h2>
                <p className="text-sm text-muted-foreground">{totalUsers} conta{totalUsers !== 1 ? 's' : ''} no sistema</p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Loja</TableHead>
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
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const expired = user.store
                          ? isPlanExpired(user.store.planExpiresAt)
                          : false;

                        return (
                          <TableRow key={user.id}>
                            {/* User */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                  {user.name.charAt(0).toUpperCase()}
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
                                <span className="text-sm">{user.store.name}</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sem loja</span>
                              )}
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
                                <span
                                  className={[
                                    'text-sm',
                                    expired ? 'font-medium text-red-600 dark:text-red-400' : '',
                                  ].join(' ')}
                                >
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
                                  {user.store._count.products}
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
