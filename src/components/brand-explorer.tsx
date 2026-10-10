'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const brands = [
  { name: 'Porsche', slug: 'porsche', mark: '/logos/porsche-crest.png' },
  { name: 'Mercedes-Benz', slug: 'mercedes-benz', mark: '/logos/mercedes.svg' },
  { name: 'BMW', slug: 'bmw', mark: '/logos/bmw-crest.svg' },
  { name: 'Toyota', slug: 'toyota', mark: '/logos/toyota.svg' },
  { name: 'Ford', slug: 'ford', mark: '/logos/ford.svg' },
  { name: 'Audi', slug: 'audi', mark: '/logos/audi.svg' },
  { name: 'Tesla', slug: 'tesla', mark: '/logos/tesla.svg' },
  { name: 'Volkswagen', slug: 'volkswagen', mark: '/logos/volkswagen.svg' },
  { name: 'Honda', slug: 'honda', mark: '/logos/honda.svg' },
  { name: 'Nissan', slug: 'nissan', mark: '/logos/nissan.svg' },
  { name: 'Chevrolet', slug: 'chevrolet', mark: '/logos/chevrolet.svg' },
  { name: 'Hyundai', slug: 'hyundai', mark: '/logos/hyundai.svg' },
  { name: 'Kia', slug: 'kia', mark: '/logos/kia.svg' },
  { name: 'Volvo', slug: 'volvo', mark: '/logos/volvo.svg' },
  { name: 'Renault', slug: 'renault', mark: '/logos/renault.svg' },
  { name: 'Lexus', slug: 'lexus', mark: '/logos/lexus.svg' },
];

export function BrandExplorer() {
  const [expanded, setExpanded] = useState(false);
  const visibleBrands = expanded ? brands : brands.slice(0, 8);

  return (
    <>
      <div className="brand-mark-grid" id="brand-mark-grid" aria-label="Browse by brand">
        {visibleBrands.map((brand, index) => (
          <Link className="brand-mark" href={`/cars?brand=${brand.slug}`} key={brand.slug} aria-label={`Explore ${brand.name} cars`} style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
            <span className="brand-mark-image"><Image src={brand.mark} alt="" fill sizes="90px" /></span>
            <span className="brand-mark-name">{brand.name}</span>
          </Link>
        ))}
      </div>
      <button className="collection-more brand-more" type="button" aria-expanded={expanded} aria-controls="brand-mark-grid" onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Show fewer brands' : `View all ${brands.length} brands`}
      </button>
    </>
  );
}
