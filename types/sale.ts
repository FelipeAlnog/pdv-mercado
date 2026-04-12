import { Product } from './product';

export interface SaleItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  dueDate?: string;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'pix' | 'pending';

export interface CartItem extends SaleItem {
  product: Product;
}

export type SaleFormData = Omit<Sale, 'id' | 'createdAt'>;
