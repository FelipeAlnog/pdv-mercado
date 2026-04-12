'use client';

import { Field } from '@/components/ui/field';
import { SimpleSelect } from '@/components/ui/simple-select';
import { Button } from '@/components/ui/button';
import { useProductForm } from '../hooks/useProductForm';
import { Product, ProductFormData } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/utils/constants';

const categoryOptions = PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }));

interface ProductFormProps {
  initial?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  prefillBarcode?: string;
}

export function ProductForm({ initial, onSubmit, onCancel, loading, prefillBarcode }: ProductFormProps) {
  const prefilled: Product | undefined = prefillBarcode
    ? { id: '', name: '', price: 0, barcode: prefillBarcode, stock: 0, minStock: 5, category: PRODUCT_CATEGORIES[0], createdAt: '', updatedAt: '' }
    : undefined;

  const { values, setField, validate, getError } = useProductForm(initial ?? prefilled);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nome do produto"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        error={getError('name')}
        placeholder="Ex: Água Mineral 500ml"
        autoFocus
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Preço (R$)"
          type="number"
          step="0.01"
          min="0"
          value={values.price || ''}
          onChange={(e) => setField('price', parseFloat(e.target.value) || 0)}
          error={getError('price')}
          placeholder="0,00"
        />
        <SimpleSelect
          label="Categoria"
          value={values.category}
          onValueChange={(v) => setField('category', v)}
          options={categoryOptions}
        />
      </div>

      <Field
        label="Código de barras"
        value={values.barcode}
        onChange={(e) => setField('barcode', e.target.value)}
        error={getError('barcode')}
        placeholder="Ex: 7891234567890"
        hint="Digite ou escaneie o código de barras"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Estoque atual"
          type="number"
          min="0"
          value={values.stock || ''}
          onChange={(e) => setField('stock', parseInt(e.target.value) || 0)}
          error={getError('stock')}
        />
        <Field
          label="Estoque mínimo"
          type="number"
          min="0"
          value={values.minStock || ''}
          onChange={(e) => setField('minStock', parseInt(e.target.value) || 0)}
          error={getError('minStock')}
          hint="Alerta de baixo estoque"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {initial ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
      </div>
    </form>
  );
}
