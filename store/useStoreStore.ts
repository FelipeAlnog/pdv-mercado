'use client';

import { create } from 'zustand';
import { LoadingState } from '@/types/common';

export interface StoreData {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  address: string | null;
  logo: string | null;
  plan: string;
}

interface StoreState {
  store: StoreData | null;
  loadingState: LoadingState;
  fetchStore: () => Promise<void>;
  updateStore: (data: Partial<Pick<StoreData, 'name' | 'phone' | 'address' | 'logo'>>) => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
  store: null,
  loadingState: 'idle',

  fetchStore: async () => {
    set({ loadingState: 'loading' });
    try {
      const res = await fetch('/api/store');
      if (!res.ok) throw new Error();
      const data = await res.json();
      set({ store: data, loadingState: 'success' });
    } catch {
      set({ loadingState: 'error' });
    }
  },

  updateStore: async (data) => {
    const res = await fetch('/api/store', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao atualizar loja.');
    }
    const updated = await res.json();
    set({ store: updated });
  },
}));
