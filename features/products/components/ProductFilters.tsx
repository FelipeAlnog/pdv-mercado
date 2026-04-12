'use client';

import { Field } from '@/components/ui/field';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useProductStore } from '@/store/useProductStore';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { Search } from 'lucide-react';

const categoryOptions = [
  { value: '', label: 'Todas as categorias' },
  ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function ProductFilters() {
  const { filters, setFilters } = useProductStore();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-48">
        <Field
          label="Buscar"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Nome ou código de barras..."
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>
      <div className="min-w-48">
        <SimpleSelect
          label="Categoria"
          value={filters.category}
          onValueChange={(v) => setFilters({ category: v === '__empty__' ? '' : v })}
          options={categoryOptions}
        />
      </div>
      <div className="flex items-center gap-2 pb-0.5">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.lowStock}
            onChange={(e) => setFilters({ lowStock: e.target.checked })}
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
          <Label className="cursor-pointer font-normal">Baixo estoque</Label>
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
