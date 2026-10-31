import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getBookingRequest } from '../../../../../backend/services/booking-requests';
import { bookingWhatsAppUrl } from '@/lib/pilot-whatsapp';
import { locationNames } from '@/lib/locations';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Request status — Rinjo' };

export default async function PilotRequestPage({ params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) notFound();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const session = await auth();
  if (!session?.user?.email) redirect(`/account/sign-in?callbackUrl=${encodeURIComponent(`/pilot/requests/${id}`)}`);
  const request = await getBookingRequest(id, session.user.email);
  if (!request) notFound();
  const whatsappUrl = request.channel === 'whatsapp' ? bookingWhatsAppUrl(request.whatsapp_number, request) : null;
  return <main id="top" className="pilot-page"><SiteHeader dark={false} /><div className="pilot-wrap pilot-result"><p className="booking-kicker">Request {request.reference}</p><h1>{request.status === 'pending' ? 'Request received.' : request.status === 'approved' ? 'Operator approved.' : 'Operator declined.'}</h1>
    <p className="pilot-intro">{request.status === 'pending' ? `${request.operator_name} will review availability and contact you. No vehicle is reserved or paid for yet.` : request.status === 'approved' ? 'The operator approved this request. Final rental terms and payment arrangements still need to be agreed directly with the operator.' : 'The operator could not accept this request. You can choose another vehicle or dates.'}</p>
    <dl className="pilot-details"><div><dt>Vehicle</dt><dd>{request.vehicle_name}</dd></div><div><dt>Pickup</dt><dd>{request.pickup} · {locationNames[request.pickup_location] || request.pickup_location}</dd></div><div><dt>Return</dt><dd>{request.returnDate}</dd></div><div><dt>Requested extras</dt><dd>{request.requested_extras.length ? request.requested_extras.map((item) => item.replaceAll('-', ' ')).join(', ') : 'None'}</dd></div><div><dt>Status</dt><dd>{request.status}</dd></div></dl>
    {whatsappUrl && <div className="pilot-whatsapp"><p>Open the prepared booking message in WhatsApp, review it, and tap Send. Rinjo cannot tell whether you sent the message.</p><a className="booking-next" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Open WhatsApp message</a></div>}
    <p className="booking-fine-print">This page is visible only while signed in with the Google account that sent the request. Save your reference to check the status later.</p><Link className="pilot-back" href="/pilot">Explore more vehicles</Link>
  </div><SiteFooter /></main>;
}
