import { Product, ProductFormData } from '@/types/product';
import { generateId } from '@/utils/formatters';
import { MOCK_DELAY_MS } from '@/utils/constants';
import { mockDb } from './mockDb';

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const productService = {
  async getAll(): Promise<Product[]> {
    await delay();
    return mockDb.getProducts();
  },

  async getById(id: string): Promise<Product | null> {
    await delay();
    return mockDb.getProductById(id) ?? null;
  },

  async getByBarcode(barcode: string): Promise<Product | null> {
    await delay(150);
    return mockDb.getProductByBarcode(barcode) ?? null;
  },

  async create(data: ProductFormData): Promise<Product> {
    await delay();
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    return mockDb.createProduct(product);
  },

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    await delay();
    const updated = mockDb.updateProduct(id, data);
    if (!updated) throw new Error(`Produto ${id} não encontrado.`);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const success = mockDb.deleteProduct(id);
    if (!success) throw new Error(`Produto ${id} não encontrado.`);
  },
};
