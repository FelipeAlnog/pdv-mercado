import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export type AuthContext = {
  userId: string;
  storeId: string;
};

type AuthResult =
  | { auth: AuthContext; error: null }
  | { auth: null; error: NextResponse };

/**
 * Verifica sessão e retorna o userId + storeId do usuário autenticado.
 * Uso: const { auth, error } = await requireAuth(req);
 *      if (error) return error;
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return {
      auth: null,
      error: NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }),
    };
  }

  const store = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });

  if (!store) {
    return {
      auth: null,
      error: NextResponse.json(
        { error: 'Loja não encontrada. Configure sua conta.' },
        { status: 403 },
      ),
    };
  }

  return { auth: { userId: session.user.id, storeId: store.id }, error: null };
}
