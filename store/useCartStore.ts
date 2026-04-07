'use client';

import { create } from 'zustand';
import { CartItem, PaymentMethod } from '@/types/sale';
import { Product } from '@/types/product';

interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;

  // Computed
  getTotal: () => number;
  getItemCount: () => number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMethod: 'cash',

  getTotal: () => {
    return get().items.reduce((acc, item) => acc + item.subtotal, 0);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        return {
          items: state.items.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: newQty, subtotal: newQty * i.unitPrice }
              : i
          ),
        };
      }
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        quantity,
        unitPrice: product.price,
        subtotal: quantity * product.price,
        product,
      };
      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity, subtotal: quantity * i.unitPrice }
          : i
      ),
    }));
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  clearCart: () => {
    set({ items: [], paymentMethod: 'cash' });
  },
}));
