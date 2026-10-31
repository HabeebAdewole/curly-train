import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPilotVehicles } from '../../../backend/services/booking-requests';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Operator vehicles — Rinjo' };

export default async function PilotPage() {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) notFound();
  const data = await getPilotVehicles();
  if (!data) notFound();
  return <main id="top" className="pilot-page"><SiteHeader dark={false} /><div className="pilot-wrap">
    <p className="booking-kicker">Operator pilot / {data.operator.city}</p><h1>Choose a vehicle.</h1>
    <p className="pilot-intro">Request a journey with {data.operator.name}. The operator checks availability and confirms the details before a rental is agreed. No payment is taken here.</p>
    <div className="pilot-vehicle-list">{data.vehicles.map((vehicle) => <article key={vehicle.id} className="pilot-vehicle"><div><p>{vehicle.category} · {vehicle.seats} seats · {vehicle.transmission}</p><h2>{vehicle.name}</h2><span>Indicative base rate: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(BigInt(vehicle.dailyRateKobo) / BigInt(100)))} / day</span></div><Link className="booking-next" href={`/pilot/${vehicle.slug}`}>Request this vehicle</Link></article>)}</div>
    {!data.vehicles.length && <p>No vehicles are accepting requests yet.</p>}
  </div><SiteFooter /></main>;
}
