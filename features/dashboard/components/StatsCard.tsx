import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
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
      </CardContent>
    </Card>
  );
}
