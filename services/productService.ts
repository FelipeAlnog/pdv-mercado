import { Product, ProductFormData } from '@/types/product';

const BASE = '/api/products';

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Erro ao buscar produtos.');
    return res.json();
  },

  async getById(id: string): Promise<Product | null> {
    const res = await fetch(`${BASE}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Erro ao buscar produto.');
    return res.json();
  },

  async getByBarcode(barcode: string): Promise<Product | null> {
    const res = await fetch(`${BASE}/barcode/${encodeURIComponent(barcode)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Erro ao buscar produto.');
    return res.json();
  },

  async create(data: ProductFormData): Promise<Product> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao cadastrar produto.');
    return res.json();
  },

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao atualizar produto.');
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir produto.');
  },
};
