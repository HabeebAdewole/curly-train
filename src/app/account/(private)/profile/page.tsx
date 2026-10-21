import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CustomerProfile } from '@/components/customer-profile';
import { authReady } from '@/lib/auth-ready';

export const metadata: Metadata = { title: 'Profile and driver details — Rinjo' };

export default async function ProfilePage() {
  if (!authReady()) redirect('/account/sign-in');
  const session = await auth();
  if (!session?.user?.email) redirect('/account/sign-in');
  return <CustomerProfile name={session.user.name || 'Driver'} email={session.user.email} />;
}
