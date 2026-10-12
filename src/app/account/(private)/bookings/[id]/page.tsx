import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CustomerBookingDetail } from '@/components/customer-booking-detail';
import { authReady } from '@/lib/auth-ready';
import { exampleBookings } from '@/lib/customer-bookings';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Journey ${(await params).id} — Morrow` };
}

export default async function BookingDetailPage({ params }: Props) {
  if (!authReady()) redirect('/account/sign-in');
  const session = await auth();
  if (!session?.user?.email) redirect('/account/sign-in');
  const { id } = await params;
  if (!exampleBookings().some((booking) => booking.id === id)) notFound();
  return <CustomerBookingDetail id={id} email={session.user.email} />;
}
