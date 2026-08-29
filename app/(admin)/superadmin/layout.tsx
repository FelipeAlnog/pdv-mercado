import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin-auth';

export const metadata = {
  title: 'Super Admin — PDV',
};

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/login');
  if (!isAdminEmail(session.user.email)) redirect('/dashboard');

  return <>{children}</>;
}
