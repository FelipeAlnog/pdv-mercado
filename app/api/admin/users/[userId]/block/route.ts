import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { admin, error } = await requireAdmin(req);
  if (error) return error;

  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, blocked: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const newBlocked = !user.blocked;

    await prisma.user.update({
      where: { id: userId },
      data: { blocked: newBlocked },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        adminEmail: admin.email,
        targetUserId: userId,
        targetEmail: user.email,
        action: newBlocked ? 'blocked' : 'unblocked',
        details: { blocked: newBlocked },
      },
    });

    return NextResponse.json({ blocked: newBlocked });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar bloqueio.' }, { status: 500 });
  }
}
