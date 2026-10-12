'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { pounds } from '@/lib/booking';
import { demoBookingAmount, type DemoBookingStatus } from '@/lib/customer-bookings';
import { formatDate } from '@/lib/dates';
import { carById } from '@/lib/fleet';
import { locationNames } from '@/lib/locations';
import { useDemoBookings } from '@/lib/use-demo-bookings';

type Filter = 'all' | DemoBookingStatus;
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All journeys' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function CustomerBookings({ email }: { email: string }) {
  const { bookings } = useDemoBookings(email);
  const [filter, setFilter] = useState<Filter>('all');
  const shown = bookings?.filter((booking) => filter === 'all' || booking.status === filter) || [];

  return <section aria-labelledby="customer-bookings-title">
    <div className="customer-section-heading"><p className="booking-kicker">01 / My bookings</p><h2 id="customer-bookings-title">Your journeys.</h2><p>Every drive has a story. Pick one to see the details.</p></div>
    <div className="customer-filters" role="group" aria-label="Filter bookings">{filters.map((item) => <button key={item.value} type="button" className={filter === item.value ? 'is-active' : ''} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
    {!bookings ? <p className="customer-empty" role="status">Loading journeys…</p> : shown.length ? <div className="customer-booking-list">{shown.map((booking) => {
      const car = carById(booking.carId);
      if (!car) return null;
      return <article className="customer-booking-row" key={booking.id}>
        <div className="customer-booking-photo"><Image src={car.image} alt={car.alt} fill sizes="(max-width: 700px) 100vw, 280px" style={{ objectPosition: car.position }} /></div>
        <div className="customer-booking-details"><div className="customer-booking-meta"><span>{booking.id}</span><span className={`customer-status customer-status--${booking.status}`}>{booking.status}</span></div><h3>{car.name}</h3><p>{locationNames[booking.location]} · {formatDate(booking.pickup)} – {formatDate(booking.returnDate)}</p><strong>{pounds(demoBookingAmount(booking))} <small>estimated total</small></strong></div>
        <Link className="customer-booking-link" href={`/account/bookings/${booking.id}`}>View details<span className="sr-only"> for {car.name}</span></Link>
      </article>;
    })}</div> : <div className="customer-empty"><strong>No {filter === 'all' ? '' : filter} journeys here.</strong><p>Choose another status to explore.</p></div>}
  </section>;
}
