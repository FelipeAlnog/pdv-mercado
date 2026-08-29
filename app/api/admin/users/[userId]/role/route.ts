import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { admin, error } = await requireAdmin(req);
  if (error) return error;

  const { userId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });
  }

  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.', details: parsed.error.flatten() }, { status: 400 });
  }

  const { role } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        adminEmail: admin.email,
        targetUserId: userId,
        targetEmail: user.email,
        action: 'role_changed',
        details: { from: user.role, to: role },
      },
    });

    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar role.' }, { status: 500 });
  }
}
