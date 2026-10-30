'use client';

import { useState } from 'react';
import Link from 'next/link';
import { naira } from '@/lib/booking';
import { DateRangePicker } from '@/components/date-range-picker';
import { dateError, rentalDays, todayInNigeria } from '@/lib/dates';

export function VehicleDates({ carId, rate, initialPickup = '', initialReturn = '', initialLocation = '' }: { carId: string; rate: number; initialPickup?: string; initialReturn?: string; initialLocation?: string }) {
  const initialValid = !dateError(initialPickup, initialReturn);
  const [pickup, setPickup] = useState(initialValid ? initialPickup : '');
  const [returnDate, setReturnDate] = useState(initialValid ? initialReturn : '');
  const days = rentalDays(pickup, returnDate);
  const valid = days > 0 && !dateError(pickup, returnDate, todayInNigeria());
  const query = new URLSearchParams({ pickup, return: returnDate });
  if (initialLocation) query.set('location', initialLocation);
  return <div className="vehicle-dates"><p className="eyebrow">SHAPE THE JOURNEY</p><h2>Make it yours.</h2><p>Choose dates to see an illustrative estimate. Availability is not confirmed.</p><DateRangePicker pickup={pickup} returnDate={returnDate} onChange={(start, end) => { setPickup(start); setReturnDate(end); }} compact />{valid ? <><div className="vehicle-estimate"><span>{days} {days === 1 ? 'day' : 'days'} × {naira(rate)}</span><strong>{naira(days * rate)}</strong></div><Link className="vehicle-book-link" href={`/book/${carId}?${query}`}>Continue with this car</Link></> : <p className="vehicle-date-hint">Select a pickup and return date to see the estimate.</p>}</div>;
}
