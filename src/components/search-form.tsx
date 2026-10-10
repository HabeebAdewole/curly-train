'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { locations } from '@/lib/locations';

function localToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function SearchForm({ initialLocation = '', initialPickup = '', initialReturn = '', initialBrand = '' }: {
  initialLocation?: string;
  initialPickup?: string;
  initialReturn?: string;
  initialBrand?: string;
}) {
  const router = useRouter();
  const errorId = useId();
  const [location, setLocation] = useState(initialLocation);
  const [pickup, setPickup] = useState(initialPickup);
  const [returnDate, setReturnDate] = useState(initialReturn);
  const [error, setError] = useState('');
  const today = localToday();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedLocation = String(form.get('location') || '');
    const selectedPickup = String(form.get('pickup') || '');
    const selectedReturn = String(form.get('return') || '');
    const selectedBrand = String(form.get('brand') || '');
    if (!selectedLocation || !selectedPickup || !selectedReturn) {
      setError('Choose a location and both dates to see cars.');
      return;
    }
    if (selectedPickup < today) {
      setError('Choose a pickup date from today onwards.');
      return;
    }
    if (selectedReturn <= selectedPickup) {
      setError('Return must be after pickup.');
      return;
    }
    setError('');
    const query = new URLSearchParams({ location: selectedLocation, pickup: selectedPickup, return: selectedReturn });
    if (selectedBrand) query.set('brand', selectedBrand);
    router.push(`/cars?${query.toString()}`);
  }

  return (
    <form className="search-form" id="search" onSubmit={submit} noValidate>
      {initialBrand && <input type="hidden" name="brand" value={initialBrand} />}
      <p className="search-caption">Your drive starts here</p>
      <div className="search-fields">
        <div className="search-field search-field--location">
          <label htmlFor="search-location">Pickup location</label>
          <select id="search-location" name="location" value={location} onChange={(event) => setLocation(event.target.value)} aria-describedby={error ? errorId : undefined}>
            <option value="">Choose a location</option>
            {locations.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="search-field">
          <label htmlFor="search-pickup">Pickup</label>
          <input id="search-pickup" name="pickup" type="date" min={today} value={pickup} onChange={(event) => {
            const next = event.target.value;
            setPickup(next);
            if (returnDate && returnDate <= next) setReturnDate('');
          }} aria-describedby={error ? errorId : undefined} />
        </div>
        <div className="search-field">
          <label htmlFor="search-return">Return</label>
          <input id="search-return" name="return" type="date" min={pickup || today} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} aria-describedby={error ? errorId : undefined} />
        </div>
        <button className="search-submit" type="submit">Show available cars</button>
      </div>
      <p className="search-error" id={errorId} role="alert">{error}</p>
    </form>
  );
}
