'use client';

import { useState } from 'react';
import { Product, ProductFormData } from '@/types/product';
import { validateProduct, ValidationError, getFieldError } from '@/utils/validators';
import { PRODUCT_CATEGORIES } from '@/utils/constants';

const defaultValues: ProductFormData = {
  name: '',
  price: 0,
  barcode: '',
  stock: 0,
  minStock: 5,
  category: PRODUCT_CATEGORIES[0],
};

export function useProductForm(initial?: Product) {
  const [values, setValues] = useState<ProductFormData>(
    initial
      ? { name: initial.name, price: initial.price, barcode: initial.barcode, stock: initial.stock, minStock: initial.minStock, category: initial.category }
      : defaultValues
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);

  function setField<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  function validate(): boolean {
    const errs = validateProduct(values);
    setErrors(errs);
    return errs.length === 0;
  }

  function reset() {
    setValues(defaultValues);
    setErrors([]);
  }

  return {
    values,
    errors,
    setField,
    validate,
    reset,
    getError: (field: string) => getFieldError(errors, field),
  };
}
