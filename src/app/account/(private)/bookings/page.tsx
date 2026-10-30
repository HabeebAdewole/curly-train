import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CustomerBookings } from '@/components/customer-bookings';
import { authReady } from '@/lib/auth-ready';

export const metadata: Metadata = { title: 'Journey plans — Rinjo' };

export default async function BookingsPage() {
  if (!authReady()) redirect('/account/sign-in');
  const session = await auth();
  if (!session?.user?.email) redirect('/account/sign-in');
  return <CustomerBookings email={session.user.email} />;
}
