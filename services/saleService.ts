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

};
