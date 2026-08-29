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
    const logs = await prisma.adminLog.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        details: true,
        adminEmail: true,
        createdAt: true,
      },
    });

    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar logs.' }, { status: 500 });
  }
}
