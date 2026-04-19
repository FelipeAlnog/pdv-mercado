'use client';

import { create } from 'zustand';
import { Customer, CustomerFormData } from '@/types/customer';
import { customerService } from '@/services/customerService';
import { LoadingState } from '@/types/common';

interface CustomerState {
  customers: Customer[];
  loadingState: LoadingState;

  fetchCustomers: () => Promise<void>;
  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loadingState: 'idle',

  fetchCustomers: async () => {
    set({ loadingState: 'loading' });
    try {
      const customers = await customerService.getAll();
      set({ customers, loadingState: 'success' });
    } catch {
      set({ loadingState: 'error' });
    }
  },

  createCustomer: async (data) => {
    const customer = await customerService.create(data);
    set((state) => ({ customers: [...state.customers, customer].sort((a, b) => a.name.localeCompare(b.name)) }));
    return customer;
  },

  updateCustomer: async (id, data) => {
    const customer = await customerService.update(id, data);
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? customer : c)),
    }));
    return customer;
  },

  deleteCustomer: async (id) => {
    await customerService.delete(id);
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
  },
}));
