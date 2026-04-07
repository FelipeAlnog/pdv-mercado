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
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'card' | 'pix';

export interface CartItem extends SaleItem {
  product: Product;
}

export type SaleFormData = Omit<Sale, 'id' | 'createdAt'>;
