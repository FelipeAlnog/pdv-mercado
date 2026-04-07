import { ProductFormData } from '@/types/product';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateProduct(data: Partial<ProductFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Nome deve ter pelo menos 2 caracteres.' });
  }

  if (data.price === undefined || data.price <= 0) {
    errors.push({ field: 'price', message: 'Preço deve ser maior que zero.' });
  }

  if (!data.barcode || data.barcode.trim().length < 3) {
    errors.push({ field: 'barcode', message: 'Código de barras inválido.' });
  }

  if (data.stock === undefined || data.stock < 0) {
    errors.push({ field: 'stock', message: 'Estoque não pode ser negativo.' });
  }

  if (data.minStock === undefined || data.minStock < 0) {
    errors.push({ field: 'minStock', message: 'Estoque mínimo não pode ser negativo.' });
  }

  return errors;
}

export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}
