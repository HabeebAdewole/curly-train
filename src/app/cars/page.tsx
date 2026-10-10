import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchForm } from '@/components/search-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { locationNames } from '@/lib/locations';

export const metadata: Metadata = {
  title: 'Find your car — Morrow',
  description: 'Choose your London pickup location and dates to explore Morrow cars.',
};

type Search = { location?: string; pickup?: string; return?: string; type?: string; brand?: string };

const brandNames: Record<string, string> = { porsche: 'Porsche', bmw: 'BMW', 'mercedes-benz': 'Mercedes-Benz', toyota: 'Toyota', ford: 'Ford', audi: 'Audi', tesla: 'Tesla', volkswagen: 'Volkswagen', honda: 'Honda', nissan: 'Nissan', chevrolet: 'Chevrolet', hyundai: 'Hyundai', kia: 'Kia', volvo: 'Volvo', renault: 'Renault', mazda: 'Mazda', lexus: 'Lexus' };

export default async function CarsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const location = params.location && locationNames[params.location] ? params.location : '';
  const pickup = /^\d{4}-\d{2}-\d{2}$/.test(params.pickup || '') ? params.pickup! : '';
  const returnDate = /^\d{4}-\d{2}-\d{2}$/.test(params.return || '') ? params.return! : '';
  const completeSearch = Boolean(location && pickup && returnDate && returnDate > pickup);
  const type = ['executive', 'performance', 'suv'].includes(params.type || '') ? params.type : '';
  const brand = params.brand && brandNames[params.brand] ? brandNames[params.brand] : '';

  return (
    <main className="cars-page" id="top">
      <SiteHeader dark={false} />
      <div className="cars-intro">
        <Link className="back-link" href="/">Back to Morrow</Link>
        <h1>{brand ? `${brand} cars.` : type ? `${type[0].toUpperCase()}${type.slice(1)} cars.` : 'Find your drive.'}</h1>
        <p>{completeSearch ? `Your search: ${locationNames[location]}, ${pickup} to ${returnDate}.` : 'Choose a pickup location and dates to begin.'}</p>
      </div>
      <div className="cars-search"><SearchForm initialLocation={location} initialPickup={pickup} initialReturn={returnDate} initialBrand={brand ? params.brand || '' : ''} /></div>
      <section className="cars-next" aria-labelledby="cars-next-title">
        <div><span className="cars-next-line" /><h2 id="cars-next-title">The collection is coming into focus.</h2></div>
        <p>Your search is saved in the address bar. In the next feature branch, this page will show matching cars, filters, prices and availability for these dates.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
