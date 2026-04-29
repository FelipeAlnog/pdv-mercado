'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  pageSizes?: number[];
  className?: string;
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4)         return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

  return [1, '...', current - 1, current, current + 1, '...', total];
}

function NavBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.88 } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </motion.button>
  );
}

export function Pagination({
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
  pageSizes = [10, 20, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-y-2 gap-x-4 border-t border-border pt-4',
        className,
      )}
    >
      {/* Left: info + items per page */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="tabular-nums">
          {total === 0
            ? 'Nenhum item'
            : `${from}–${to} de ${total} item${total !== 1 ? 's' : ''}`}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-xs">Exibir</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSize(Number(e.target.value));
              onPage(1);
            }}
            className="cursor-pointer rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {pageSizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="text-xs">por página</span>
        </div>
      </div>

      {/* Right: page controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-0.5">
          <NavBtn onClick={() => onPage(1)} disabled={page === 1} label="Primeira página">
            <ChevronsLeft className="h-3.5 w-3.5" />
          </NavBtn>
          <NavBtn onClick={() => onPage(page - 1)} disabled={page === 1} label="Página anterior">
            <ChevronLeft className="h-3.5 w-3.5" />
          </NavBtn>

          <div className="flex items-center gap-0.5 px-1">
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-6 items-center justify-center text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => onPage(p as number)}
                  className={cn(
                    'flex h-8 min-w-[2rem] cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors',
                    p === page
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {p}
                </motion.button>
              ),
            )}
          </div>

          <NavBtn onClick={() => onPage(page + 1)} disabled={page === totalPages} label="Próxima página">
            <ChevronRight className="h-3.5 w-3.5" />
          </NavBtn>
          <NavBtn onClick={() => onPage(totalPages)} disabled={page === totalPages} label="Última página">
            <ChevronsRight className="h-3.5 w-3.5" />
          </NavBtn>
        </div>
      )}
    </div>
  );
}
