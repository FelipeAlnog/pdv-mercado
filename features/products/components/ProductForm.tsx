'use client';

import { useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
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
  const barcodeRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef('');
  const scanTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // In edit mode, auto-focus barcode field so scanner input lands there
  useEffect(() => {
    if (initial) {
      setTimeout(() => barcodeRef.current?.focus(), 150);
    }
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  }

  // Detect fast scanner input: characters arrive < 50ms apart, then Enter
  const handleBarcodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setField('barcode', val);

    // Track rapid input (scanner pattern)
    clearTimeout(scanTimerRef.current);
    scanBufferRef.current = val;
    scanTimerRef.current = setTimeout(() => {
      scanBufferRef.current = '';
    }, 100);
  }, [setField]);

  function handleBarcodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      const currentBarcode = (e.target as HTMLInputElement).value.trim();
      if (!currentBarcode) return;

      // Always update the field value from DOM
      setField('barcode', currentBarcode);

      if (!initial) {
        // Create mode: submit the form
        const updatedValues = { ...values, barcode: currentBarcode };
        if (validate()) onSubmit(updatedValues);
      } else {
        // Edit mode: just confirm the barcode was scanned, don't close modal
        toast.success(`Código ${currentBarcode} preenchido. Clique "Salvar" para confirmar.`);
      }
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nome do produto"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        error={getError('name')}
        placeholder="Ex: Água Mineral 500ml"
        autoFocus={!initial}
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
        ref={barcodeRef}
        label="Código de barras"
        value={values.barcode}
        onChange={handleBarcodeChange}
        onKeyDown={handleBarcodeKeyDown}
        spellCheck={false}
        autoComplete="on"
        error={getError('barcode')}
        placeholder="Ex: 7891234567890"
        hint={initial ? "Escaneie para atualizar e salvar automaticamente" : "Digite ou escaneie o código de barras"}
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
