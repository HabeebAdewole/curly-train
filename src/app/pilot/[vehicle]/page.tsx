import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getPilotVehicles } from '../../../../backend/services/booking-requests';
import { PilotRequestForm } from '@/components/pilot-request-form';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Request a vehicle — Rinjo' };

export default async function PilotVehiclePage({ params }: { params: Promise<{ vehicle: string }> }) {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) notFound();
  const [{ vehicle: slug }, data, session] = await Promise.all([params, getPilotVehicles(), auth()]);
  const vehicle = data?.vehicles.find((item) => item.slug === slug);
  if (!data || !vehicle) notFound();
  return <main id="top" className="pilot-page"><SiteHeader dark={false} /><div className="pilot-wrap">
    <Link className="pilot-back" href="/pilot">← All vehicles</Link><p className="booking-kicker">Journey request / {data.operator.name}</p><h1>{vehicle.name}.</h1>
    {session?.user?.email ? <PilotRequestForm vehicle={vehicle} operator={data.operator} /> : <div className="pilot-signin"><p>Sign in with Google to send a request and track its status on Rinjo.</p><Link className="booking-next" href={`/account/sign-in?callbackUrl=${encodeURIComponent(`/pilot/${slug}`)}`}>Sign in to request</Link></div>}
  </div><SiteFooter /></main>;
}
