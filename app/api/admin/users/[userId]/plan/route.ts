import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updatePlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO']),
  planExpiresAt: z.string().datetime({ offset: true }).nullable().optional(),
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

  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.', details: parsed.error.flatten() }, { status: 400 });
  }

  const { plan, planExpiresAt } = parsed.data;

  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      select: { id: true, plan: true, planExpiresAt: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Usuário sem loja cadastrada.' }, { status: 404 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const oldPlan = store.plan;
    const oldExpiresAt = store.planExpiresAt;

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        plan,
        planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null,
      },
      select: { plan: true, planExpiresAt: true },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.userId,
        adminEmail: admin.email,
        targetUserId: userId,
        targetEmail: targetUser?.email ?? '',
        action: 'plan_changed',
        details: {
          from: oldPlan,
          to: plan,
          oldExpiresAt: oldExpiresAt?.toISOString() ?? null,
          expiresAt: planExpiresAt ?? null,
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar plano.' }, { status: 500 });
  }
}
