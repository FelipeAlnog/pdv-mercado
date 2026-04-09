import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();

  const products = await prisma.product.createManyAndReturn({
    data: [
      { name: 'Água Mineral 500ml',   price: 2.5,  barcode: '7891234567890', stock: 50, minStock: 10, category: 'Bebidas'    },
      { name: 'Refrigerante Cola 2L', price: 8.9,  barcode: '7891234567891', stock: 30, minStock: 5,  category: 'Bebidas'    },
      { name: 'Leite Integral 1L',    price: 4.5,  barcode: '7891234567892', stock: 3,  minStock: 10, category: 'Laticínios' },
      { name: 'Pão de Forma 500g',    price: 6.0,  barcode: '7891234567893', stock: 15, minStock: 5,  category: 'Padaria'    },
      { name: 'Arroz Branco 5kg',     price: 22.9, barcode: '7891234567894', stock: 20, minStock: 5,  category: 'Mercearia'  },
      { name: 'Feijão Carioca 1kg',   price: 8.5,  barcode: '7891234567895', stock: 2,  minStock: 5,  category: 'Mercearia'  },
      { name: 'Sabão em Pó 1kg',      price: 12.9, barcode: '7891234567896', stock: 25, minStock: 5,  category: 'Limpeza'    },
      { name: 'Papel Higiênico 12un', price: 18.9, barcode: '7891234567897', stock: 40, minStock: 10, category: 'Higiene'    },
    ],
  });

  const [agua, refri] = products;

  await prisma.sale.create({
    data: {
      total: 20.3,
      paymentMethod: 'cash',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: agua.id,  productName: agua.name,  barcode: agua.barcode,  quantity: 3, unitPrice: 2.5, subtotal: 7.5  },
          { productId: refri.id, productName: refri.name, barcode: refri.barcode, quantity: 1, unitPrice: 8.9, subtotal: 8.9  },
        ],
      },
    },
  });

  await prisma.sale.create({
    data: {
      total: 8.5,
      paymentMethod: 'pix',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[5].id, productName: products[5].name, barcode: products[5].barcode, quantity: 1, unitPrice: 8.5, subtotal: 8.5 },
        ],
      },
    },
  });

  console.log(`Seeded ${products.length} products and 2 sales.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
