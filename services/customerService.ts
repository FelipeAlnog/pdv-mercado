import { Customer, CustomerFormData } from '@/types/customer';

const BASE = '/api/customers';

function normalize(c: Customer & { createdAt: string; updatedAt: string }): Customer {
  return {
    ...c,
    createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toISOString(),
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : new Date(c.updatedAt).toISOString(),
  };
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Erro ao buscar clientes.');
    const data = await res.json();
    return data.map(normalize);
  },

  async create(data: CustomerFormData): Promise<Customer> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Erro ao cadastrar cliente.');
    }
    return normalize(await res.json());
  },

  async update(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Erro ao atualizar cliente.');
    }
    return normalize(await res.json());
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? 'Erro ao excluir cliente.');
    }
  },
};
