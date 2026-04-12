import { Sale, SaleFormData } from '@/types/sale';
import { generateId } from '@/utils/formatters';
import { MOCK_DELAY_MS } from '@/utils/constants';
import { mockDb } from './mockDb';

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const saleService = {
  async getAll(): Promise<Sale[]> {
    await delay();
    return mockDb.getSales();
  },

  async create(data: SaleFormData): Promise<Sale> {
    await delay();
    const sale: Sale = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    return mockDb.createSale(sale);
  },

  async update(id: string, updates: Partial<Sale>): Promise<Sale> {
    await delay();
    const sale = mockDb.updateSale(id, updates);
    if (!sale) throw new Error('Venda não encontrada');
    return sale;
  },
};
