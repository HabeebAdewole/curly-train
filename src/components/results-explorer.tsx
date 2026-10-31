'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { brandNames, categories, fleet, type CarCategory } from '@/lib/fleet';
import { naira } from '@/lib/booking';

type Filter = { type: string; price: string; seats: string; transmission: string; sort: string };
const defaultFilter: Filter = { type: '', price: '', seats: '', transmission: '', sort: 'featured' };

export function ResultsExplorer({ brand, query, initialFilter }: { brand: string; query: string; initialFilter: Filter }) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const matching = fleet.filter((car) => (!brand || car.brandSlug === brand) && (!filter.type || car.category.toLowerCase() === filter.type) && (!filter.price || car.dailyRate <= Number(filter.price)) && (!filter.seats || car.seats >= Number(filter.seats)) && (!filter.transmission || car.transmission.toLowerCase() === filter.transmission));
  const sorted = [...matching].sort((a, b) => filter.sort === 'price-low' ? a.dailyRate - b.dailyRate : filter.sort === 'price-high' ? b.dailyRate - a.dailyRate : 0);
  const brandWithoutCars = Boolean(brand && !fleet.some((car) => car.brandSlug === brand));
  const active = Boolean(brand || filter.type || filter.price || filter.seats || filter.transmission || filter.sort !== 'featured');

  function update(next: Filter, nextBrand = brand) {
    setFilter(next);
    const params = new URLSearchParams(query);
    for (const [key, value] of Object.entries(next)) { if (value && value !== 'featured') params.set(key, value); else params.delete(key); }
    if (nextBrand) params.set('brand', nextBrand); else params.delete('brand');
    router.replace(`/cars${params.size ? `?${params}` : ''}`, { scroll: false });
  }
  function clear() { update(defaultFilter, ''); }
  function detailUrl(id: string) { const params = new URLSearchParams(query); for (const [key, value] of Object.entries(filter)) { if (value && value !== 'featured') params.set(key, value); else params.delete(key); } if (brand) params.set('brand', brand); return `/cars/${id}${params.size ? `?${params}` : ''}`; }

  return <section className="results-section" aria-labelledby="results-title">
    <div className="results-heading"><div><p className="eyebrow">THE COLLECTION / NIGERIA</p><h2 id="results-title">Find your fit.</h2></div><p>Explore the details, then shape the dates around your drive.</p></div>
    <div className="results-toolbar">
      <div className="results-types" role="group" aria-label="Vehicle type">{['All', ...categories].map((item) => { const value = item === 'All' ? '' : (item as CarCategory).toLowerCase(); return <button key={item} className={`filter-pill${filter.type === value ? ' is-active' : ''}`} type="button" aria-pressed={filter.type === value} onClick={() => update({ ...filter, type: value })}>{item}</button>; })}</div>
      <div className="results-selects"><label>Daily rate <select aria-label="Maximum daily rate" value={filter.price} onChange={(event) => update({ ...filter, price: event.target.value })}><option value="">Any rate</option><option value="200000">Up to ₦200,000</option><option value="300000">Up to ₦300,000</option><option value="400000">Up to ₦400,000</option><option value="600000">Up to ₦600,000</option></select></label><label>Seats <select aria-label="Minimum seats" value={filter.seats} onChange={(event) => update({ ...filter, seats: event.target.value })}><option value="">Any</option><option value="4">4+</option><option value="5">5+</option><option value="7">7+</option></select></label><label>Transmission <select value={filter.transmission} onChange={(event) => update({ ...filter, transmission: event.target.value })}><option value="">Any</option><option value="automatic">Automatic</option><option value="manual">Manual</option></select></label></div>
    </div>
    <div className="results-meta"><p aria-live="polite">{sorted.length} {sorted.length === 1 ? 'car' : 'cars'} to explore</p><div>{active && <button type="button" className="text-control" onClick={clear}>Clear filters</button>}<label>Sort <select value={filter.sort} onChange={(event) => update({ ...filter, sort: event.target.value })}><option value="featured">Featured</option><option value="price-low">Rate: low to high</option><option value="price-high">Rate: high to low</option></select></label></div></div>
    {sorted.length ? <div className="results-grid" key={`${brand}-${Object.values(filter).join('-')}`}>{sorted.map((car, index) => <article className="result-car" key={car.id} style={{ '--car-delay': `${Math.min(index % 9, 8) * 75}ms` } as React.CSSProperties}><Link className="result-image" href={detailUrl(car.id)}><Image src={car.image} alt={car.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" style={{ objectPosition: car.position }} /><span>{car.category}</span></Link><div className="result-copy"><div><p>{car.brand} · {car.seats} seats · {car.transmission}</p><h3>{car.name}</h3></div><div className="result-rate"><strong>{naira(car.dailyRate)}</strong><span>/ day</span></div></div><Link className="result-explore" href={detailUrl(car.id)}>View the car <span aria-hidden="true">↗</span></Link></article>)}</div> : <div className="results-empty"><span className="results-empty-line" /><h3>{brandWithoutCars ? `${brandNames[brand]} is not in this collection yet.` : 'No cars match those choices.'}</h3><p>{brandWithoutCars ? 'Explore the full collection to find another drive.' : 'Try a higher daily rate, fewer seats, or a different type.'}</p><button type="button" className="pill pill--outline" onClick={clear}>Show all cars</button></div>}
  </section>;
}
