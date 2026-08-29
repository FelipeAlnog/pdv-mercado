import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export type AdminContext = {
  userId: string;
  email: string;
};

type AdminResult =
  | { admin: AdminContext; error: null }
  | { admin: null; error: NextResponse };

/**
 * Verifica se o usuário autenticado é um admin.
 * Admins são definidos pela variável de ambiente ADMIN_EMAILS (separados por vírgula).
 */
export async function requireAdmin(req: NextRequest): Promise<AdminResult> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }),
    };
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];

  if (!adminEmails.includes(session.user.email.toLowerCase())) {
    return {
      admin: null,
      error: NextResponse.json({ error: 'Acesso negado.' }, { status: 403 }),
    };
  }

  return { admin: { userId: session.user.id, email: session.user.email }, error: null };
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  return adminEmails.includes(email.toLowerCase());
}
