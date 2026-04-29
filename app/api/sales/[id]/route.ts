import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { parseBody, updateSaleSchema } from '@/lib/validation/schemas';
import { handlePrismaError } from '@/lib/prisma-errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { auth, error } = await requireAuth(req);
  if (error) return error;

  const { data, error: bodyError } = await parseBody(req, updateSaleSchema);
  if (bodyError) return bodyError;

  try {
    const { id } = await params;

    const sale = await prisma.sale.update({
      where: { id, storeId: auth.storeId },
      data: {
        ...(data.paidAt        !== undefined && { paidAt:        data.paidAt ? new Date(data.paidAt) : null }),
        ...(data.dueDate       !== undefined && { dueDate:       data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.customerName  !== undefined && { customerName:  data.customerName }),
        ...(data.customerPhone !== undefined && { customerPhone: data.customerPhone }),
        ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
      },
      include: { items: true },
    });

    return NextResponse.json({
      ...sale,
      createdAt: sale.createdAt.toISOString(),
      dueDate:   sale.dueDate?.toISOString() ?? null,
      paidAt:    sale.paidAt?.toISOString() ?? null,
    });
  } catch (e) {
    return handlePrismaError(e, 'venda');
  }
}
