import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { VehicleDates } from '@/components/vehicle-dates';
import { carById, fleet } from '@/lib/fleet';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export function generateStaticParams() { return fleet.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const car = carById((await params).id); return { title: car ? `${car.name} — Morrow` : 'Car not found — Morrow', description: car?.character }; }

export default async function CarDetail({ params, searchParams }: Props) {
  const car = carById((await params).id);
  if (!car) notFound();
  const raw = await searchParams;
  const query = new URLSearchParams();
  for (const key of ['location', 'pickup', 'return', 'brand', 'type', 'price', 'seats', 'transmission', 'sort']) { const value = raw[key]; if (typeof value === 'string') query.set(key, value); }
  const index = fleet.findIndex(({ id }) => id === car.id);
  const pickup = typeof raw.pickup === 'string' ? raw.pickup : '';
  const returnDate = typeof raw.return === 'string' ? raw.return : '';
  return <main className="vehicle-page" id="top"><SiteHeader dark={false} /><div className="vehicle-wrap"><Link className="back-link" href={`/cars${query.size ? `?${query}` : ''}`}>Morrow / The collection / {car.brand}</Link><div className="vehicle-heading"><div><p className="eyebrow">{car.category.toUpperCase()} / {car.brand.toUpperCase()}</p><h1>{car.name}<span>.</span></h1><p>{car.character}</p></div><div className="vehicle-heading-rate"><strong>£{car.dailyRate}</strong><span>per day</span></div></div><div className="vehicle-photo"><Image src={car.image} alt={car.alt} fill priority sizes="100vw" style={{ objectPosition: car.position }} /><span>EXTERIOR / {car.name.toUpperCase()}</span></div><div className="vehicle-content"><div className="vehicle-story"><p className="eyebrow">THE DETAILS</p><h2>More than the way there.</h2><div className="vehicle-specs"><div><span>01 / SEATS</span><strong>{car.seats} seats</strong></div><div><span>02 / DRIVE</span><strong>{car.transmission}</strong></div><div><span>03 / CLASS</span><strong>{car.category}</strong></div></div><ul>{car.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>{car.interior && <figure className="vehicle-interior"><div><Image src={car.interior} alt={car.interiorAlt || `${car.name} interior`} fill sizes="(max-width: 800px) 100vw, 60vw" /></div></figure>}</div><VehicleDates carId={car.id} rate={car.dailyRate} index={index} initialPickup={pickup} initialReturn={returnDate} initialLocation={typeof raw.location === 'string' ? raw.location : ''} /></div></div><SiteFooter /></main>;
}
