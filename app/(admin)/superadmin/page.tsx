'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
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
import { exportToExcelMultiSheet, exportToPDFMultiSection } from '@/lib/export';
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
  Ban,
  Shield,
  ShieldOff,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Plan = 'FREE' | 'PRO';
type Role = 'USER' | 'ADMIN';
type StatusFilter = 'all' | 'active' | 'inactive' | 'blocked';
type SortField = 'name' | 'createdAt' | 'plan' | 'planExpiresAt' | 'status';
type SortDir = 'asc' | 'desc';

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
  blocked: boolean;
  role: Role;
  store: UserStore;
};

type AdminLog = {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  adminEmail: string;
  createdAt: string;
};

type UserDetail = AdminUser & {
  store: (NonNullable<UserStore> & { totalRevenue: number; lastSaleAt: string | null }) | null;
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

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function isPlanExpired(planExpiresAt: string | null) {
  if (!planExpiresAt) return false;
  return new Date(planExpiresAt) < new Date();
}

function daysUntilExpiry(planExpiresAt: string | null): number | null {
  if (!planExpiresAt) return null;
  const diff = new Date(planExpiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(planExpiresAt: string | null): boolean {
  const days = daysUntilExpiry(planExpiresAt);
  return days !== null && days >= 0 && days <= 7;
}

function getUserStatus(user: AdminUser): 'blocked' | 'active' | 'inactive' | 'nostore' {
  if (user.blocked) return 'blocked';
  if (!user.store) return 'nostore';
  if (user.store.plan === 'FREE') return 'active';
  if (isPlanExpired(user.store.planExpiresAt)) return 'inactive';
  return 'active';
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

function addDaysToDate(base: string | null, days: number): string {
  const from = base && new Date(base) > new Date() ? new Date(base) : new Date();
  from.setDate(from.getDate() + days);
  return from.toISOString().slice(0, 10);
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    plan_changed: 'Plano alterado',
    blocked: 'Usuário bloqueado',
    unblocked: 'Usuário desbloqueado',
    role_changed: 'Role alterada',
  };
  return map[action] ?? action;
}

// ─── SortIcon ─────────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ChevronsUpDown className="ml-1 inline h-3 w-3 text-muted-foreground/50" />;
  return sortDir === 'asc'
    ? <ChevronUp className="ml-1 inline h-3 w-3" />
    : <ChevronDown className="ml-1 inline h-3 w-3" />;
}

// ─── Edit Plan Dialog ─────────────────────────────────────────────────────────

type EditDialogProps = {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSaved: (userId: string, plan: Plan, planExpiresAt: string | null) => void;
};

function EditPlanDialog({ user, open, onClose, onSaved }: EditDialogProps) {
  const [plan, setPlan] = useState<Plan>(user.store?.plan ?? 'FREE');
  const [expiresAt, setExpiresAt] = useState<string>(toDateInputValue(user.store?.planExpiresAt ?? null));
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
      const planExpiresAt = expiresAt ? new Date(expiresAt + 'T23:59:59.000Z').toISOString() : null;
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

  const quickExtensions = [
    { label: '+7 dias', days: 7 },
    { label: '+30 dias', days: 30 },
    { label: '+3 meses', days: 90 },
    { label: '+1 ano', days: 365 },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Assinatura do Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Extensão rápida</label>
            <div className="flex flex-wrap gap-2">
              {quickExtensions.map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setExpiresAt(addDaysToDate(user.store?.planExpiresAt ?? null, days))}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Data de expiração da assinatura</label>
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
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Spinner size="sm" className="mr-2" />}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── User Detail Dialog ───────────────────────────────────────────────────────

function UserDetailDialog({
  userId,
  open,
  onClose,
}: {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'data' | 'history'>('data');

  useEffect(() => {
    if (!open || !userId) return;
    setDetail(null);
    setLogs([]);
    setTab('data');
    setLoading(true);

    Promise.all([
      fetch(`/api/admin/users/${userId}`).then((r) => r.json()),
      fetch(`/api/admin/users/${userId}/logs`).then((r) => r.json()),
    ])
      .then(([d, l]) => {
        setDetail(d);
        setLogs(Array.isArray(l) ? l : []);
      })
      .catch(() => toast.error('Erro ao carregar detalhes.'))
      .finally(() => setLoading(false));
  }, [open, userId]);

  const status = detail ? getUserStatus(detail) : 'nostore';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" className="text-primary" />
          </div>
        )}

        {!loading && detail && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {getInitials(detail.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{detail.name}</h2>
                  {detail.role === 'ADMIN' && (
                    <Badge variant="info"><Shield className="h-3 w-3" /> Admin</Badge>
                  )}
                  {detail.blocked ? (
                    <Badge variant="danger"><Ban className="h-3 w-3" /> Bloqueado</Badge>
                  ) : (
                    <Badge variant={status === 'active' ? 'success' : 'secondary'}>
                      {status === 'active' ? <><CheckCircle2 className="h-3 w-3" /> Ativo</> : <><XCircle className="h-3 w-3" /> Inativo</>}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{detail.email}</p>
                <p className="text-xs text-muted-foreground">Membro desde {formatDate(detail.createdAt)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg border border-border bg-muted/40 p-1 text-sm">
              {([{ key: 'data', label: 'Dados' }, { key: 'history', label: 'Histórico' }] as const).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={[
                    'flex-1 rounded-md px-3 py-1.5 font-medium transition-all',
                    tab === key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'data' && (
              <>
                {/* Store cards */}
                {detail.store ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total de vendas</p>
                        <p className="mt-1 text-xl font-bold">{detail.store._count.sales}</p>
                        <ShoppingCart className="mt-1 h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Faturamento total</p>
                        <p className="mt-1 text-xl font-bold">{formatCurrency(detail.store.totalRevenue)}</p>
                        <DollarSign className="mt-1 h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Produtos</p>
                        <p className="mt-1 text-xl font-bold">{detail.store._count.product}</p>
                        <Package className="mt-1 h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Clientes</p>
                        <p className="mt-1 text-xl font-bold">{detail.store._count.customers}</p>
                        <Users className="mt-1 h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Plano atual</p>
                        <p className="mt-1 text-xl font-bold">{detail.store.plan}</p>
                        <Crown className="mt-1 h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Última venda</p>
                        <p className="mt-1 text-sm font-semibold">{formatDate(detail.store.lastSaleAt)}</p>
                        <Clock className="mt-1 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium">Loja: <span className="text-foreground">{detail.store.name}</span></p>
                      {detail.store.planExpiresAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expira em: {formatDate(detail.store.planExpiresAt)}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    Este usuário não possui loja cadastrada.
                  </div>
                )}
              </>
            )}

            {tab === 'history' && (
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    Nenhuma ação registrada.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{actionLabel(log.action)}</p>
                        <p className="text-xs text-muted-foreground">por {log.adminEmail}</p>
                        {log.details && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono truncate">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color = 'primary', onClick, active,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'emerald' | 'red' | 'violet' | 'amber';
  onClick?: () => void;
  active?: boolean;
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    red:     'bg-red-500/10 text-red-600 dark:text-red-400',
    violet:  'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    amber:   'bg-amber-500/10 text-amber-600 dark:text-amber-400',
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

// ─── Export Menu ──────────────────────────────────────────────────────────────

function ExportButton({ users }: { users: AdminUser[] }) {
  const [open, setOpen] = useState(false);

  function buildRows(list: AdminUser[]) {
    return list.map((u) => [
      u.name,
      u.email,
      u.store?.name ?? '—',
      u.blocked ? 'Bloqueado' : getUserStatus(u) === 'active' ? 'Ativo' : getUserStatus(u) === 'inactive' ? 'Inativo' : 'Sem loja',
      u.store?.plan ?? '—',
      formatDate(u.store?.planExpiresAt ?? null),
      u.store?._count.sales ?? 0,
      u.store?._count.product ?? 0,
      u.store?._count.customers ?? 0,
      formatDate(u.createdAt),
    ] as (string | number)[]);
  }

  const headers = ['Nome', 'Email', 'Loja', 'Status', 'Plano', 'Expira em', 'Vendas', 'Produtos', 'Clientes', 'Cadastro'];

  const summaryRows: (string | number)[][] = [
    ['Total de usuários', users.length],
    ['Ativos', users.filter((u) => getUserStatus(u) === 'active').length],
    ['Inativos', users.filter((u) => getUserStatus(u) === 'inactive').length],
    ['Bloqueados', users.filter((u) => u.blocked).length],
    ['Plano PRO', users.filter((u) => u.store?.plan === 'PRO' && !isPlanExpired(u.store.planExpiresAt)).length],
  ];

  function handleExcel() {
    exportToExcelMultiSheet('clientes-superadmin', [
      { name: 'Clientes', headers, rows: buildRows(users) },
      { name: 'Resumo', headers: ['Métrica', 'Valor'], rows: summaryRows },
    ]);
    setOpen(false);
  }

  function handlePDF() {
    exportToPDFMultiSection(
      'Relatório de Clientes',
      [
        { subtitle: 'Clientes', headers, rows: buildRows(users) },
        { subtitle: 'Resumo', headers: ['Métrica', 'Valor'], rows: summaryRows },
      ],
      'clientes-superadmin',
      true,
    );
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
        <Download className="h-4 w-4" />
        Exportar
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-border bg-card shadow-lg">
            <button
              type="button"
              onClick={handleExcel}
              className="flex w-full items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm hover:bg-muted/60"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={handlePDF}
              className="flex w-full items-center gap-2 rounded-b-xl px-4 py-2.5 text-sm hover:bg-muted/60"
            >
              <FileText className="h-4 w-4 text-red-500" />
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function SuperAdminPage() {
  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [editUser, setEditUser]         = useState<AdminUser | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField]       = useState<SortField>('createdAt');
  const [sortDir, setSortDir]           = useState<SortDir>('desc');
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(PAGE_SIZE);

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
        u.id === userId && u.store ? { ...u, store: { ...u.store, plan, planExpiresAt } } : u,
      ),
    );
  }

  async function handleBlock(user: AdminUser) {
    const prev = users;
    setUsers((us) => us.map((u) => u.id === user.id ? { ...u, blocked: !u.blocked } : u));
    try {
      const res = await fetch(`/api/admin/users/${user.id}/block`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers((us) => us.map((u) => u.id === user.id ? { ...u, blocked: data.blocked } : u));
      toast.success(data.blocked ? 'Usuário bloqueado.' : 'Usuário desbloqueado.');
    } catch {
      setUsers(prev);
      toast.error('Erro ao alterar bloqueio.');
    }
  }

  async function handleRole(user: AdminUser) {
    const newRole: Role = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const prev = users;
    setUsers((us) => us.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      toast.success(newRole === 'ADMIN' ? 'Usuário promovido a admin.' : 'Admin rebaixado para usuário.');
    } catch {
      setUsers(prev);
      toast.error('Erro ao alterar role.');
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalClients    = users.length;
  const activeClients   = users.filter((u) => getUserStatus(u) === 'active').length;
  const inactiveClients = users.filter((u) => getUserStatus(u) === 'inactive').length;
  const blockedClients  = users.filter((u) => u.blocked).length;
  const proClients      = users.filter((u) => u.store?.plan === 'PRO' && !isPlanExpired(u.store.planExpiresAt)).length;

  // ── Filtered + sorted list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    const list = users.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.store?.name ?? '').toLowerCase().includes(q);

      const status = getUserStatus(u);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && status === 'active') ||
        (statusFilter === 'inactive' && status === 'inactive') ||
        (statusFilter === 'blocked' && u.blocked);

      return matchSearch && matchStatus;
    });

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'plan':
          cmp = (a.store?.plan ?? '').localeCompare(b.store?.plan ?? '');
          break;
        case 'planExpiresAt':
          cmp = (a.store?.planExpiresAt ?? '').localeCompare(b.store?.planExpiresAt ?? '');
          break;
        case 'status':
          cmp = getUserStatus(a).localeCompare(getUserStatus(b));
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [users, search, statusFilter, sortField, sortDir]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, sortField, sortDir]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Gerenciamento de Clientes</h1>
            <p className="text-sm text-muted-foreground">Visualize e gerencie todos os clientes do sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton users={filtered} />
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={['h-4 w-4', loading ? 'animate-spin' : ''].join(' ')} />
              Atualizar
            </Button>
          </div>
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
              className="grid grid-cols-2 gap-4 sm:grid-cols-5"
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="visible"
            >
              <StatCard label="Total" value={totalClients} icon={<Users className="h-5 w-5" />} color="primary" onClick={() => setStatusFilter('all')} active={statusFilter === 'all'} />
              <StatCard label="Ativos" value={activeClients} icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" onClick={() => setStatusFilter('active')} active={statusFilter === 'active'} />
              <StatCard label="Inativos" value={inactiveClients} icon={<XCircle className="h-5 w-5" />} color="red" onClick={() => setStatusFilter('inactive')} active={statusFilter === 'inactive'} />
              <StatCard label="Bloqueados" value={blockedClients} icon={<Ban className="h-5 w-5" />} color="amber" onClick={() => setStatusFilter('blocked')} active={statusFilter === 'blocked'} />
              <StatCard label="Plano PRO" value={proClients} icon={<Crown className="h-5 w-5" />} color="violet" />
            </motion.div>

            {/* Search + filters */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...EASE_OUT, delay: 0.15 }}
            >
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

              <div className="flex rounded-lg border border-border bg-muted/40 p-1 text-sm">
                {([
                  { key: 'all',      label: 'Todos' },
                  { key: 'active',   label: 'Ativos' },
                  { key: 'inactive', label: 'Inativos' },
                  { key: 'blocked',  label: 'Bloqueados' },
                ] as { key: StatusFilter; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={[
                      'rounded-md px-3 py-1 font-medium transition-all',
                      statusFilter === key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
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
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                        Cliente <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                      </TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                        Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort('plan')}>
                        Plano <SortIcon field="plan" sortField={sortField} sortDir={sortDir} />
                      </TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort('planExpiresAt')}>
                        Expira em <SortIcon field="planExpiresAt" sortField={sortField} sortDir={sortDir} />
                      </TableHead>
                      <TableHead className="text-center">Vendas</TableHead>
                      <TableHead className="text-center">Produtos</TableHead>
                      <TableHead className="text-center">Clientes</TableHead>
                      <TableHead className="cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                        Cadastro <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                      </TableHead>
                      <TableHead className="w-28">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <UserX className="h-8 w-8 opacity-40" />
                            <p className="text-sm">Nenhum cliente encontrado.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((user) => {
                        const status   = getUserStatus(user);
                        const expired  = user.store ? isPlanExpired(user.store.planExpiresAt) : false;
                        const expiring = user.store ? isExpiringSoon(user.store.planExpiresAt) : false;
                        const daysLeft = user.store ? daysUntilExpiry(user.store.planExpiresAt) : null;

                        return (
                          <TableRow key={user.id} className={user.blocked ? 'opacity-60' : ''}>
                            {/* Client */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {getInitials(user.name)}
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    className="text-sm font-medium leading-tight hover:underline text-left"
                                    onClick={() => setDetailUserId(user.id)}
                                  >
                                    {user.name}
                                    {user.role === 'ADMIN' && (
                                      <Badge variant="info" className="ml-1.5 text-[10px]">Admin</Badge>
                                    )}
                                  </button>
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
                              {user.blocked ? (
                                <Badge variant="danger"><Ban className="h-3 w-3" /> Bloqueado</Badge>
                              ) : status === 'active' ? (
                                <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Ativo</Badge>
                              ) : status === 'inactive' ? (
                                <Badge variant="danger"><XCircle className="h-3 w-3" /> Inativo</Badge>
                              ) : (
                                <Badge variant="secondary">Sem loja</Badge>
                              )}
                            </TableCell>

                            {/* Plan */}
                            <TableCell>
                              {user.store ? (
                                <Badge
                                  variant={user.store.plan === 'PRO' ? 'default' : 'secondary'}
                                  className={user.store.plan === 'PRO' ? 'bg-violet-500/10 text-violet-700 dark:text-violet-400' : ''}
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
                                expiring && !expired ? (
                                  <Badge variant="warning">
                                    <AlertTriangle className="h-3 w-3" />
                                    Expira em {daysLeft}d
                                  </Badge>
                                ) : (
                                  <span className={['text-sm', expired ? 'text-red-600 dark:text-red-400 font-medium' : ''].join(' ')}>
                                    {formatDate(user.store.planExpiresAt)}
                                    {expired && (
                                      <span className="ml-1.5 rounded bg-red-50 px-1 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                                        EXPIRADO
                                      </span>
                                    )}
                                  </span>
                                )
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

                            {/* Actions */}
                            <TableCell>
                              <div className="flex items-center gap-1">
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
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={['h-8 w-8', user.blocked ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-600 hover:text-amber-700'].join(' ')}
                                  onClick={() => handleBlock(user)}
                                  title={user.blocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
                                >
                                  {user.blocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={['h-8 w-8', user.role === 'ADMIN' ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground'].join(' ')}
                                  onClick={() => handleRole(user)}
                                  title={user.role === 'ADMIN' ? 'Rebaixar para usuário' : 'Promover a admin'}
                                >
                                  {user.role === 'ADMIN' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="px-6 py-4">
                <Pagination
                  total={filtered.length}
                  page={safePage}
                  pageSize={pageSize}
                  onPage={setPage}
                  onPageSize={(s) => { setPageSize(s); setPage(1); }}
                />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Edit plan dialog */}
      {editUser && (
        <EditPlanDialog
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Detail dialog */}
      <UserDetailDialog
        userId={detailUserId}
        open={!!detailUserId}
        onClose={() => setDetailUserId(null)}
      />
    </div>
  );
}
