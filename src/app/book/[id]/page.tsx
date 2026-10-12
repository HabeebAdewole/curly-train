import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingWizard } from '@/components/booking-wizard';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { carById } from '@/lib/fleet';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = carById((await params).id);
  return { title: car ? `Plan your ${car.name} drive — Morrow` : 'Car not found — Morrow' };
}

export default async function BookPage({ params, searchParams }: Props) {
  const car = carById((await params).id);
  if (!car) notFound();
  const query = await searchParams;
  const single = (key: string) => typeof query[key] === 'string' ? query[key] as string : '';
  return <main className="booking-page" id="top">
    <SiteHeader dark={false} />
    <div className="booking-wrap">
      <Link className="back-link" href={`/cars/${car.id}`}>Morrow / {car.name}</Link>
      <BookingWizard car={car} initialPickup={single('pickup')} initialReturn={single('return')} initialLocation={single('location')} canceled={single('canceled') === '1'} />
    </div>
    <SiteFooter />
  </main>;
}
