'use client';

import { create } from 'zustand';
import { Product, ProductFilters, ProductFormData } from '@/types/product';
import { productService } from '@/services/productService';
import { LoadingState } from '@/types/common';

interface ProductState {
  products: Product[];
  filters: ProductFilters;
  loadingState: LoadingState;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<Product>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  getFilteredProducts: () => Product[];
  getByBarcode: (barcode: string) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filters: { search: '', category: '', lowStock: false },
  loadingState: 'idle',
  error: null,

  fetchProducts: async () => {
    set({ loadingState: 'loading', error: null });
    try {
      const products = await productService.getAll();
      set({ products, loadingState: 'success' });
    } catch (err) {
      set({ loadingState: 'error', error: (err as Error).message });
    }
  },

  createProduct: async (data) => {
    const product = await productService.create(data);
    set((state) => ({ products: [...state.products, product] }));
    return product;
  },

  updateProduct: async (id, data) => {
    const updated = await productService.update(id, data);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deleteProduct: async (id) => {
    await productService.delete(id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  getFilteredProducts: () => {
    const { products, filters } = get();
    return products.filter((p) => {
      const matchSearch =
        !filters.search ||
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.barcode.includes(filters.search);
      const matchCategory = !filters.category || p.category === filters.category;
      const matchLowStock = !filters.lowStock || p.stock <= p.minStock;
      return matchSearch && matchCategory && matchLowStock;
    });
  },

  getByBarcode: async (barcode) => {
    return productService.getByBarcode(barcode);
  },
}));
