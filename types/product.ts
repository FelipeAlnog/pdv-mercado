export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  stock: number;
  minStock: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface ProductFilters {
  search: string;
  category: string;
  lowStock: boolean;
}
