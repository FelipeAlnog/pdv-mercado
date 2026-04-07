'use client';

import { create } from 'zustand';
import { Sale, SaleFormData } from '@/types/sale';
import { saleService } from '@/services/saleService';
import { isToday } from '@/utils/formatters';
import { LoadingState } from '@/types/common';

interface SaleState {
  sales: Sale[];
  loadingState: LoadingState;

  fetchSales: () => Promise<void>;
  createSale: (data: SaleFormData) => Promise<Sale>;
  getTodaySales: () => Sale[];
  getTodayRevenue: () => number;
}

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  loadingState: 'idle',

  fetchSales: async () => {
    set({ loadingState: 'loading' });
    try {
      const sales = await saleService.getAll();
      set({ sales, loadingState: 'success' });
    } catch {
      set({ loadingState: 'error' });
    }
  },

  createSale: async (data) => {
    const sale = await saleService.create(data);
    set((state) => ({ sales: [sale, ...state.sales] }));
    return sale;
  },

  getTodaySales: () => get().sales.filter((s) => isToday(s.createdAt)),

  getTodayRevenue: () =>
    get()
      .sales.filter((s) => isToday(s.createdAt))
      .reduce((acc, s) => acc + s.total, 0),
}));
