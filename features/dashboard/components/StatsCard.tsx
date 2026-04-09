import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient?: string;
  trend?: { value: string; up: boolean };
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient = 'from-blue-500 to-blue-600',
  trend,
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-inset ring-white/10 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                trend.up
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
              )}
            >
              {trend.up ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
