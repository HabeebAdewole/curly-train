'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { fleet, type CarCategory } from '@/lib/fleet';

type Category = 'All cars' | CarCategory;
const categories: Category[] = ['All cars', 'Performance', 'Executive', 'SUV', 'Electric'];

export function CollectionGallery() {
  const [category, setCategory] = useState<Category>('All cars');
  const [expanded, setExpanded] = useState(false);
  const filtered = category === 'All cars' ? fleet : fleet.filter((car) => car.category === category);
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
            <Link className="collection-car-image" href={`/cars/${car.id}`} aria-label={`Explore ${car.name}`}>
              <Image src={car.image} alt={car.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" style={{ objectPosition: car.position }} />
              <span className="collection-image-tag">{car.category}</span>
            </Link>
            <div className="collection-car-copy"><div><span>{car.brand}</span><h3>{car.name}</h3></div><Link href={`/cars/${car.id}`} aria-label={`Explore ${car.name}`} className="collection-car-link">Explore</Link></div>
          </article>
        ))}
      </div>
      {filtered.length > 6 && <button className="collection-more" type="button" aria-expanded={expanded} aria-controls="collection-grid" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show fewer cars' : `See all ${filtered.length} cars`}</button>}
      <p className="collection-demo-note">A visual preview of the collection. Vehicle availability will be confirmed when booking opens.</p>
    </>
  );
}
