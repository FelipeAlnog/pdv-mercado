import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const OWNER_ID = '8290189c-76c4-4114-8997-e7fd3884c6c1';

async function main() {
  console.log('Seeding database...');

  // ── Loja ──────────────────────────────────────────────────────────────────
  const store = await prisma.store.upsert({
    where: { ownerId: OWNER_ID },
    update: {},
    create: {
      ownerId: OWNER_ID,
      name: 'Meu Mercado',
      cpf: '000.000.000-00',
      address: '',
      phone: '',
      plan: 'FREE',
    },
  });

  console.log(`Loja: ${store.name} (${store.id})`);

  // ── Limpar dados anteriores da loja ───────────────────────────────────────
  await prisma.saleItem.deleteMany({ where: { storeId: store.id } });
  await prisma.sale.deleteMany({ where: { storeId: store.id } });
  await prisma.product.deleteMany({ where: { storeId: store.id } });
  await prisma.customer.deleteMany({ where: { storeId: store.id } });

  // ── Produtos ──────────────────────────────────────────────────────────────
  const products = await prisma.product.createManyAndReturn({
    data: [
      { storeId: store.id, name: 'Água Mineral 500ml',   price: 2.5,  barcode: '7891234567890', stock: 50, minStock: 10, category: 'Bebidas'    },
      { storeId: store.id, name: 'Refrigerante Cola 2L', price: 8.9,  barcode: '7891234567891', stock: 30, minStock: 5,  category: 'Bebidas'    },
      { storeId: store.id, name: 'Leite Integral 1L',    price: 4.5,  barcode: '7891234567892', stock: 3,  minStock: 10, category: 'Laticínios' },
      { storeId: store.id, name: 'Pão de Forma 500g',    price: 6.0,  barcode: '7891234567893', stock: 15, minStock: 5,  category: 'Padaria'    },
      { storeId: store.id, name: 'Arroz Branco 5kg',     price: 22.9, barcode: '7891234567894', stock: 20, minStock: 5,  category: 'Mercearia'  },
      { storeId: store.id, name: 'Feijão Carioca 1kg',   price: 8.5,  barcode: '7891234567895', stock: 2,  minStock: 5,  category: 'Mercearia'  },
      { storeId: store.id, name: 'Sabão em Pó 1kg',      price: 12.9, barcode: '7891234567896', stock: 25, minStock: 5,  category: 'Limpeza'    },
      { storeId: store.id, name: 'Papel Higiênico 12un', price: 18.9, barcode: '7891234567897', stock: 40, minStock: 10, category: 'Higiene'    },
    ],
  });

  console.log(`${products.length} produtos criados.`);

  // ── Clientes ──────────────────────────────────────────────────────────────
  const cliente = await prisma.customer.create({
    data: {
      storeId: store.id,
      name: 'Maria Silva',
      phone: '11 99999-1111',
      cpf: '111.111.111-11',
    },
  });

  // ── Vendas ────────────────────────────────────────────────────────────────
  const [agua, refri, , , , feijao] = products;

  await prisma.sale.create({
    data: {
      storeId: store.id,
      total: 16.4,
      paymentMethod: 'cash',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      items: {
        create: [
          { storeId: store.id, productId: agua.id,  productName: agua.name,  barcode: agua.barcode,  quantity: 3, unitPrice: 2.5, subtotal: 7.5 },
          { storeId: store.id, productId: refri.id, productName: refri.name, barcode: refri.barcode, quantity: 1, unitPrice: 8.9, subtotal: 8.9 },
        ],
      },
    },
  });

  await prisma.sale.create({
    data: {
      storeId: store.id,
      total: 8.5,
      paymentMethod: 'pix',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      items: {
        create: [
          { storeId: store.id, productId: feijao.id, productName: feijao.name, barcode: feijao.barcode, quantity: 1, unitPrice: 8.5, subtotal: 8.5 },
        ],
      },
    },
  });

  // Venda no fiado vinculada ao cliente
  await prisma.sale.create({
    data: {
      storeId: store.id,
      total: 13.5,
      paymentMethod: 'pending',
      customerId: cliente.id,
      customerName: cliente.name,
      customerPhone: cliente.phone ?? '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      items: {
        create: [
          { storeId: store.id, productId: agua.id,  productName: agua.name,  barcode: agua.barcode,  quantity: 2, unitPrice: 2.5, subtotal: 5.0 },
          { storeId: store.id, productId: feijao.id, productName: feijao.name, barcode: feijao.barcode, quantity: 1, unitPrice: 8.5, subtotal: 8.5 },
        ],
      },
    },
  });

  console.log('3 vendas criadas (cash, pix, fiado).');
  console.log('Seed concluído.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
