import { Product } from '@/types/product';
import { Sale } from '@/types/sale';

// Seed data - produtos iniciais para demonstração
const seedProducts: Product[] = [
  {
    id: '1',
    name: 'Água Mineral 500ml',
    price: 2.5,
    barcode: '7891234567890',
    stock: 50,
    minStock: 10,
    category: 'Bebidas',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '2',
    name: 'Refrigerante Cola 2L',
    price: 8.9,
    barcode: '7891234567891',
    stock: 30,
    minStock: 5,
    category: 'Bebidas',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '3',
    name: 'Leite Integral 1L',
    price: 4.5,
    barcode: '7891234567892',
    stock: 3,
    minStock: 10,
    category: 'Laticínios',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '4',
    name: 'Pão de Forma 500g',
    price: 6.0,
    barcode: '7891234567893',
    stock: 15,
    minStock: 5,
    category: 'Padaria',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '5',
    name: 'Arroz Branco 5kg',
    price: 22.9,
    barcode: '7891234567894',
    stock: 20,
    minStock: 5,
    category: 'Mercearia',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '6',
    name: 'Feijão Carioca 1kg',
    price: 8.5,
    barcode: '7891234567895',
    stock: 2,
    minStock: 5,
    category: 'Mercearia',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '7',
    name: 'Sabão em Pó 1kg',
    price: 12.9,
    barcode: '7891234567896',
    stock: 25,
    minStock: 5,
    category: 'Limpeza',
    createdAt: new Date('2024-01-11').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
  },
  {
    id: '8',
    name: 'Shampoo 400ml',
    price: 15.5,
    barcode: '7891234567897',
    stock: 4,
    minStock: 5,
    category: 'Higiene',
    createdAt: new Date('2024-01-11').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
  },
];

const seedSales: Sale[] = [
  {
    id: 'sale-1',
    items: [
      {
        productId: '1',
        productName: 'Água Mineral 500ml',
        barcode: '7891234567890',
        quantity: 3,
        unitPrice: 2.5,
        subtotal: 7.5,
      },
      {
        productId: '5',
        productName: 'Arroz Branco 5kg',
        barcode: '7891234567894',
        quantity: 1,
        unitPrice: 22.9,
        subtotal: 22.9,
      },
    ],
    total: 30.4,
    paymentMethod: 'pix',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sale-2',
    items: [
      {
        productId: '2',
        productName: 'Refrigerante Cola 2L',
        barcode: '7891234567891',
        quantity: 2,
        unitPrice: 8.9,
        subtotal: 17.8,
      },
    ],
    total: 17.8,
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
  },
];

// In-memory storage — simula banco de dados
class MockDatabase {
  private products: Product[] = [...seedProducts];
  private sales: Sale[] = [...seedSales];
  private storageKey = 'pdv_mock_db';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.products = parsed.products ?? [...seedProducts];
        this.sales = parsed.sales ?? [...seedSales];
      }
    } catch {
      // ignore parse errors
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({ products: this.products, sales: this.sales })
      );
    } catch {
      // ignore storage errors
    }
  }

  getProducts(): Product[] {
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getProductByBarcode(barcode: string): Product | undefined {
    return this.products.find((p) => p.barcode === barcode);
  }

  createProduct(product: Product): Product {
    this.products.push(product);
    this.persist();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.products[index] = { ...this.products[index], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    this.persist();
    return true;
  }

  getSales(): Sale[] {
    return [...this.sales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createSale(sale: Sale): Sale {
    this.sales.push(sale);
    // Decrement stock for each item
    sale.items.forEach((item) => {
      const idx = this.products.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        this.products[idx] = {
          ...this.products[idx],
          stock: Math.max(0, this.products[idx].stock - item.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
    });
    this.persist();
    return sale;
  }

  updateSale(id: string, updates: Partial<Sale>): Sale | null {
    const index = this.sales.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.sales[index] = { ...this.sales[index], ...updates };
    this.persist();
    return this.sales[index];
  }

  reset(): void {
    this.products = [...seedProducts];
    this.sales = [...seedSales];
    this.persist();
  }
}

export const mockDb = new MockDatabase();
