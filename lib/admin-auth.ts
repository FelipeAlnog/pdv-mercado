import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export type AdminContext = { userId: string; email: string; };

type AdminResult =
  | { admin: AdminContext; error: null }
  | { admin: null; error: NextResponse };

export async function requireAdmin(req: NextRequest): Promise<AdminResult> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return { admin: null, error: NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }) };
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  const isEmailAdmin = adminEmails.includes(session.user.email.toLowerCase());

  if (!isEmailAdmin) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return { admin: null, error: NextResponse.json({ error: 'Acesso negado.' }, { status: 403 }) };
    }
  }

  return { admin: { userId: session.user.id, email: session.user.email }, error: null };
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  return adminEmails.includes(email.toLowerCase());
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  });
  if (!user) return false;
  return adminEmails.includes(user.email.toLowerCase()) || user.role === 'ADMIN';
}
