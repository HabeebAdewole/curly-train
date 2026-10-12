'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { DateRangePicker } from '@/components/date-range-picker';
import { dateError, todayInLondon } from '@/lib/dates';
import { locations } from '@/lib/locations';

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
    const problem = dateError(selectedPickup, selectedReturn, todayInLondon());
    if (problem) { setError(problem); return; }
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
        <div className="search-date-field">
          <input type="hidden" name="pickup" value={pickup} />
          <input type="hidden" name="return" value={returnDate} />
          <DateRangePicker pickup={pickup} returnDate={returnDate} onChange={(nextPickup, nextReturn) => { setPickup(nextPickup); setReturnDate(nextReturn); setError(''); }} />
        </div>
        <button className="search-submit" type="submit">Explore cars</button>
      </div>
      <p className="search-error" id={errorId} role="alert">{error}</p>
    </form>
  );
}
