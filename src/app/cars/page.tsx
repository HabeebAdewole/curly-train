import type { Metadata } from 'next';
import Link from 'next/link';
import { ResultsExplorer } from '@/components/results-explorer';
import { SearchForm } from '@/components/search-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { dateError, formatDate, todayInLondon } from '@/lib/dates';
import { brandNames, fleet } from '@/lib/fleet';
import { locationNames } from '@/lib/locations';

export const metadata: Metadata = { title: 'Explore cars — Morrow', description: 'Explore the Morrow demo fleet and compare vehicle details.' };
type Search = Record<string, string | string[] | undefined>;
function single(value: string | string[] | undefined) { return typeof value === 'string' ? value : ''; }

export default async function CarsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const location = locationNames[single(raw.location)] ? single(raw.location) : '';
  const pickup = single(raw.pickup), returnDate = single(raw.return);
  const validDates = !dateError(pickup, returnDate, todayInLondon());
  const invalidRequestedDates = Boolean((pickup || returnDate) && !validDates);
  const brand = brandNames[single(raw.brand)] ? single(raw.brand) : '';
  const filter = {
    type: ['performance', 'executive', 'suv', 'electric'].includes(single(raw.type)) ? single(raw.type) : '',
    price: ['150', '200', '300', '400'].includes(single(raw.price)) ? single(raw.price) : '',
    seats: ['4', '5', '7'].includes(single(raw.seats)) ? single(raw.seats) : '',
    transmission: ['automatic', 'manual'].includes(single(raw.transmission)) ? single(raw.transmission) : '',
    sort: ['price-low', 'price-high'].includes(single(raw.sort)) ? single(raw.sort) : 'featured',
  };
  const query = new URLSearchParams();
  if (location) query.set('location', location);
  if (validDates) { query.set('pickup', pickup); query.set('return', returnDate); }
  if (brand) query.set('brand', brand);
  return <main className="cars-page" id="top"><SiteHeader dark={false} /><div className="cars-intro"><Link className="back-link" href="/">Morrow / The collection</Link><h1>{brand ? `${brandNames[brand]}.` : 'The drive is yours.'}</h1><p>{location && validDates ? `${locationNames[location]} · ${formatDate(pickup)} to ${formatDate(returnDate)}` : brand && !fleet.some((car) => car.brandSlug === brand) ? 'This marque is not part of the current demo fleet.' : 'Twelve distinct ways to make the journey yours.'}</p>{invalidRequestedDates && <p className="cars-date-notice" role="alert">Those dates could not be used. Please choose a new pickup and return range.</p>}</div><div className="cars-search"><SearchForm key={`${location}-${pickup}-${returnDate}-${brand}`} initialLocation={location} initialPickup={validDates ? pickup : ''} initialReturn={validDates ? returnDate : ''} initialBrand={brand} /></div><ResultsExplorer key={JSON.stringify(raw)} brand={brand} query={query.toString()} initialFilter={filter} /><SiteFooter /></main>;
}
