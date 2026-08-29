import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { admin, error } = await requireAdmin(req);
  if (error) return error;

  void admin;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar usuários.' }, { status: 500 });
  }
}
