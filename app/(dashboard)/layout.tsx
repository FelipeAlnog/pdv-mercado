import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { SessionGuard } from '@/components/layout/SessionGuard';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const store = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true },
  });
  if (!store) redirect('/setup');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Limpa todos os stores se o userId mudar (proteção LGPD) */}
      <SessionGuard />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-screen-xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
