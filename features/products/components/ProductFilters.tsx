'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useProductStore } from '@/store/useProductStore';
import { PRODUCT_CATEGORIES } from '@/utils/constants';

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function ProductFilters() {
  const { filters, setFilters } = useProductStore();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <Input
          label="Buscar"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Nome ou código de barras..."
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>
      <div className="min-w-48">
        <Select
          label="Categoria"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
          options={categoryOptions}
        />
      </div>
      <div className="flex items-center gap-2 pb-0.5">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.lowStock}
            onChange={(e) => setFilters({ lowStock: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Baixo estoque
        </label>
      </div>
      {(filters.search || filters.category || filters.lowStock) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({ search: '', category: '', lowStock: false })}
        >
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
