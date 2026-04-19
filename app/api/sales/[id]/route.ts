import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updates = await req.json();

  const data: Record<string, unknown> = {};
  if (updates.paidAt !== undefined) data.paidAt = updates.paidAt ? new Date(updates.paidAt) : null;
  if (updates.dueDate !== undefined) data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  if (updates.customerName !== undefined) data.customerName = updates.customerName;
  if (updates.customerPhone !== undefined) data.customerPhone = updates.customerPhone;
  if (updates.paymentMethod !== undefined) data.paymentMethod = updates.paymentMethod;

  const sale = await prisma.sale.update({
    where: { id },
    data,
    include: { items: true },
  });

  return NextResponse.json({
    ...sale,
    createdAt: sale.createdAt.toISOString(),
    dueDate: sale.dueDate?.toISOString() ?? null,
    paidAt: sale.paidAt?.toISOString() ?? null,
  });
}
