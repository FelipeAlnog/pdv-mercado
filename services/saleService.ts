import { Sale, SaleFormData } from '@/types/sale';

const BASE = '/api/sales';

export const saleService = {
  async getAll(): Promise<Sale[]> {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Erro ao buscar vendas.');
    const data = await res.json();
    // Normalize dates: API returns DateTime objects, our type uses ISO strings
    return data.map((s: Sale & { createdAt: string }) => ({
      ...s,
      createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(s.createdAt).toISOString(),
    }));
  },

  async create(data: SaleFormData): Promise<Sale> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Erro ao registrar venda.');
    const sale = await res.json();
    return {
      ...sale,
      createdAt: typeof sale.createdAt === 'string' ? sale.createdAt : new Date(sale.createdAt).toISOString(),
    };
  },

  async update(id: string, updates: Partial<Sale>): Promise<Sale> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Erro ao atualizar venda.');
    const sale = await res.json();
    return {
      ...sale,
      createdAt: typeof sale.createdAt === 'string' ? sale.createdAt : new Date(sale.createdAt).toISOString(),
    };
  },
};
