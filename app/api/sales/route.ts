import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// ATENÇÃO: todas as vendas a prazo geram registro de devedor — revisar lógica antes de alterar paymentMethod

export async function GET(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const sales = await prisma.sale.findMany({
      where: { storeId: auth.storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sales);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar vendas.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { items, total, paymentMethod, customerName, customerPhone, dueDate, customerId } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'A venda deve ter ao menos um item.' }, { status: 400 });
    }
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Total inválido.' }, { status: 400 });
    }

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          storeId: auth.storeId,
          total,
          paymentMethod,
          ...(customerName && { customerName }),
          ...(customerPhone && { customerPhone }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(customerId && { customerId }),
          items: {
            create: items.map((item: {
              productId: string;
              productName: string;
              barcode: string;
              quantity: number;
              unitPrice: number;
              subtotal: number;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              barcode: item.barcode,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              storeId: auth.storeId,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock only for products that belong to this store
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId, storeId: auth.storeId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar venda.' }, { status: 500 });
  }
}
