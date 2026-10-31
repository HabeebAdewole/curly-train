import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { getStaffRequests } from '../../../../backend/services/booking-requests';
import { PilotStaffDesk } from '@/components/pilot-staff-desk';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Operator requests — Rinjo' };

export default async function PilotStaffPage() {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) notFound();
  const session = await auth();
  if (!session?.user?.email) redirect('/account/sign-in?callbackUrl=/pilot/staff');
  const data = await getStaffRequests(session.user.email);
  if (!data) notFound();
  return <main id="top" className="pilot-page"><SiteHeader dark={false} /><div className="pilot-wrap"><p className="booking-kicker">{data.operator.name} / operations</p><h1>Booking requests.</h1><p className="pilot-intro">Review each enquiry before approving it. The server checks overlapping approved dates when you decide.</p><PilotStaffDesk initial={data.requests.map((item) => ({ id: item.id, reference: item.reference, status: item.status, customerName: item.customer_name, customerEmail: item.customer_email, vehicle: item.vehicle_name, pickup: item.pickup, returnDate: item.returnDate, location: item.pickup_location, channel: item.channel }))} /></div><SiteFooter /></main>;
}
