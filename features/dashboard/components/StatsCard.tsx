import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: string; up: boolean };
}

export function StatsCard({ title, value, subtitle, icon, iconBg = 'bg-blue-100 text-blue-600', trend }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', trend.up ? 'text-green-600' : 'text-red-500')}>
              {trend.up ? '▲' : '▼'} {trend.value}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconBg, 'dark:opacity-90')}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
