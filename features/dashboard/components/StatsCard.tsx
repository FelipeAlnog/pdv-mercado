'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { STAGGER_ITEM, SPRING } from '@/lib/motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient?: string;
  trend?: { value: string; up: boolean };
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  gradient = 'from-blue-500 to-blue-600',
  trend,
  onClick,
}: StatsCardProps) {
  return (
    <motion.div
      variants={STAGGER_ITEM}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={SPRING}
    >
      <Card
        className={cn(
          'group overflow-hidden transition-shadow duration-200 hover:shadow-lg',
          onClick && 'cursor-pointer hover:border-primary/40',
        )}
        onClick={onClick}
      >
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>

              <motion.p
                className="mt-2 text-3xl font-bold tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {value}
              </motion.p>

              {subtitle && (
                <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
              )}

              {trend && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className={cn(
                    'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    trend.up
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
                  )}
                >
                  {trend.up ? '↑' : '↓'} {trend.value}
                </motion.div>
              )}
            </div>

            <motion.div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                gradient,
              )}
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
