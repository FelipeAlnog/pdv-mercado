import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { SetupForm } from './SetupForm';

export const metadata = { title: 'Configurar Loja — PDV Mercado' };

export default async function SetupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const store = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (store) redirect('/dashboard');

  return <SetupForm />;
}
