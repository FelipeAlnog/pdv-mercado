import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const sales = await prisma.sale.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const { items, total, paymentMethod, customerName, customerPhone, dueDate, customerId } = await req.json();

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
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
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock for each item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json(sale, { status: 201 });
}
