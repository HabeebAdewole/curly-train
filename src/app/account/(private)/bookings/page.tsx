import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CustomerBookings } from '@/components/customer-bookings';
import { authReady } from '@/lib/auth-ready';
import { getCustomerRequests } from '../../../../../backend/services/booking-requests';

export const metadata: Metadata = { title: 'Journey plans — Rinjo' };

export default async function BookingsPage() {
  if (!authReady()) redirect('/account/sign-in');
  const session = await auth();
  if (!session?.user?.email) redirect('/account/sign-in');
  const requests = process.env.DATABASE_URL && process.env.PILOT_OPERATOR_SLUG
    ? await getCustomerRequests(session.user.email)
    : [];
  return <CustomerBookings email={session.user.email} requests={requests} pilotAvailable={Boolean(process.env.DATABASE_URL && process.env.PILOT_OPERATOR_SLUG)} />;
}
