'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Category = 'All cars' | 'Performance' | 'Executive' | 'SUV' | 'Electric';
const categories: Category[] = ['All cars', 'Performance', 'Executive', 'SUV', 'Electric'];
const cars: { name: string; brand: string; slug: string; category: Exclude<Category, 'All cars'>; image: string; alt: string; position?: string }[] = [
  { name: 'Mercedes-Benz S-Class', brand: 'Mercedes-Benz', slug: 'mercedes-benz', category: 'Executive', image: '/media/mercedes-s-class.webp', alt: 'Graphite Mercedes-Benz S-Class against a pale studio backdrop' },
  { name: 'Porsche 911 Turbo S', brand: 'Porsche', slug: 'porsche', category: 'Performance', image: '/media/porsche-911-turbo-s.webp', alt: 'Matte black Porsche 911 Turbo S parked outdoors' },
  { name: 'Ford Mustang', brand: 'Ford', slug: 'ford', category: 'Performance', image: '/media/ford-mustang-blue.webp', alt: 'Blue Ford Mustang in side profile beneath an open sky' },
  { name: 'Tesla Model 3', brand: 'Tesla', slug: 'tesla', category: 'Electric', image: '/media/tesla-model-3.webp', alt: 'White Tesla Model 3 driving along a quiet road' },
  { name: 'Mercedes-Benz G-Class', brand: 'Mercedes-Benz', slug: 'mercedes-benz', category: 'SUV', image: '/media/mercedes-g.webp', alt: 'Silver Mercedes-Benz G-Class shown from the side' },
  { name: 'Audi RS6 Avant', brand: 'Audi', slug: 'audi', category: 'Performance', image: '/media/audi-rs6.webp', alt: 'Dark Audi RS6 Avant on a wet road at dusk' },
  { name: 'Toyota Highlander', brand: 'Toyota', slug: 'toyota', category: 'SUV', image: '/media/toyota-highlander.webp', alt: 'White Toyota Highlander in side profile against brick' },
  { name: 'BMW M4', brand: 'BMW', slug: 'bmw', category: 'Performance', image: '/media/bmw-m4.webp', alt: 'Dark BMW M4 with sculpted bonnet and front wheel visible' },
  { name: 'Audi A4', brand: 'Audi', slug: 'audi', category: 'Executive', image: '/media/audi-a4.webp', alt: 'Silver Audi A4 on a quiet roadside', position: '40% center' },
  { name: 'Lexus NX', brand: 'Lexus', slug: 'lexus', category: 'SUV', image: '/media/lexus-suv.webp', alt: 'Blue Lexus SUV parked in an open lot' },
  { name: 'Ford Mustang GT', brand: 'Ford', slug: 'ford', category: 'Performance', image: '/media/ford-mustang-white.webp', alt: 'White Ford Mustang photographed in motion at golden hour' },
  { name: 'BMW M4 Coupé', brand: 'BMW', slug: 'bmw', category: 'Performance', image: '/media/bmw-m4-white.webp', alt: 'White BMW M4 photographed from behind on a city street' },
];

export function CollectionGallery() {
  const [category, setCategory] = useState<Category>('All cars');
  const [expanded, setExpanded] = useState(false);
  const filtered = category === 'All cars' ? cars : cars.filter((car) => car.category === category);
  const visible = expanded ? filtered : filtered.slice(0, 6);

  function selectCategory(next: Category) {
    setCategory(next);
    setExpanded(false);
  }

  return (
    <>
      <div className="collection-toolbar">
        <div className="collection-filters" role="group" aria-label="Filter the collection">
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} className={`collection-filter${category === item ? ' is-active' : ''}`} onClick={() => selectCategory(item)}>{item}</button>
          ))}
        </div>
        <span className="collection-count">{filtered.length} cars to explore</span>
      </div>
      <div className="collection-grid" id="collection-grid" aria-live="polite">
        {visible.map((car, index) => (
          <article className="collection-car" key={car.name} style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}>
            <Link className="collection-car-image" href={`/cars?brand=${car.slug}`} aria-label={`Explore ${car.brand} cars`}>
              <Image src={car.image} alt={car.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" style={{ objectPosition: car.position }} />
              <span className="collection-image-tag">{car.category}</span>
            </Link>
            <div className="collection-car-copy"><div><span>{car.brand}</span><h3>{car.name}</h3></div><Link href={`/cars?brand=${car.slug}`} aria-label={`Explore ${car.brand} cars`} className="collection-car-link">Explore</Link></div>
          </article>
        ))}
      </div>
      {filtered.length > 6 && <button className="collection-more" type="button" aria-expanded={expanded} aria-controls="collection-grid" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer cars' : `See all ${filtered.length} cars`}</button>}
      <p className="collection-demo-note">A visual preview of the collection. Vehicle availability will be confirmed when booking opens.</p>
    </>
  );
}
