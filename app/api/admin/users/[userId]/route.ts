import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        blocked: true,
        role: true,
        store: {
          select: {
            id: true,
            name: true,
            plan: true,
            planExpiresAt: true,
            createdAt: true,
            _count: {
              select: { sales: true, product: true, customers: true },
            },
            sales: {
              select: { total: true, createdAt: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    let storeData = null;
    if (user.store) {
      const { sales, ...storeRest } = user.store;
      const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
      const lastSaleAt = sales.length > 0 ? sales[0].createdAt.toISOString() : null;

      storeData = {
        ...storeRest,
        totalRevenue,
        lastSaleAt,
      };
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      blocked: user.blocked,
      role: user.role,
      store: storeData,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar usuário.' }, { status: 500 });
  }
}
