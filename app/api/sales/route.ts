import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { parseBody, createSaleSchema } from '@/lib/validation/schemas';

// Vendas a prazo geram devedor — não alterar paymentMethod sem revisar a lógica de debtors
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

  const { data, error: bodyError } = await parseBody(req, createSaleSchema);
  if (bodyError) return bodyError;

  try {
    const productIds = [...new Set(data.items.map((i) => i.productId))];

    // Busca preços reais do banco — impede manipulação de preço pelo cliente
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId: auth.storeId },
      select: { id: true, name: true, barcode: true, price: true, stock: true },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais produtos não encontrados nesta loja.' },
        { status: 400 },
      );
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Verifica estoque antes de criar a venda
    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para "${product.name}" (disponível: ${product.stock}).` },
          { status: 400 },
        );
      }
    }

    // Total calculado pelo servidor — cliente não define o preço
    const total = Math.round(
      data.items.reduce((sum, item) => sum + productMap.get(item.productId)!.price * item.quantity, 0) * 100,
    ) / 100;

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          storeId:       auth.storeId,
          total,
          paymentMethod: data.paymentMethod,
          ...(data.customerName  && { customerName:  data.customerName }),
          ...(data.customerPhone && { customerPhone: data.customerPhone }),
          ...(data.dueDate       && { dueDate: new Date(data.dueDate) }),
          ...(data.customerId    && { customerId: data.customerId }),
          items: {
            create: data.items.map((item) => {
              const p = productMap.get(item.productId)!;
              return {
                productId:   item.productId,
                productName: p.name,
                barcode:     p.barcode,
                quantity:    item.quantity,
                unitPrice:   p.price,
                subtotal:    Math.round(p.price * item.quantity * 100) / 100,
                storeId:     auth.storeId,
              };
            }),
          },
        },
        include: { items: true },
      });

      // Decrementa estoque somente para produtos desta loja
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId, storeId: auth.storeId },
          data:  { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar venda.' }, { status: 500 });
  }
}
