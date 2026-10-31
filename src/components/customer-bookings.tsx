'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { calculateQuote, naira } from '@/lib/booking';
import { demoBookingAmount, type DemoBookingStatus } from '@/lib/customer-bookings';
import { parseSavedPlans, savedPlansSnapshot, subscribeSavedPlans } from '@/lib/demo-checkout';
import { formatDate } from '@/lib/dates';
import { carById } from '@/lib/fleet';
import { locationNames } from '@/lib/locations';
import { useDemoBookings } from '@/lib/use-demo-bookings';

type CustomerRequest = {
  id: string;
  reference: string;
  pickup: string;
  returnDate: string;
  pickup_location: string;
  status: 'pending' | 'approved' | 'declined';
  vehicle_name: string;
  created_at: string;
};

type Filter = 'all' | DemoBookingStatus;
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All journeys' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function CustomerBookings({ email, requests, pilotAvailable }: { email: string; requests: CustomerRequest[]; pilotAvailable: boolean }) {
  const { bookings } = useDemoBookings(email);
  const savedPlans = parseSavedPlans(useSyncExternalStore(subscribeSavedPlans, savedPlansSnapshot, () => null));
  const [filter, setFilter] = useState<Filter>('all');
  const shown = bookings?.filter((booking) => filter === 'all' || booking.status === filter) || [];

  return <section aria-labelledby="customer-bookings-title">
    {pilotAvailable && <section className="customer-requests" aria-labelledby="customer-requests-title">
      <div className="customer-section-heading"><p className="booking-kicker">Operator enquiries</p><h2 id="customer-requests-title">Your requests.</h2><p>Requests are reviewed by the rental operator. Approval is not a payment or a confirmed rental agreement.</p></div>
      {requests.length ? <div className="customer-booking-list">{requests.map((request) => <article className="customer-booking-row customer-request-row" key={request.id}>
        <div className="customer-booking-details"><div className="customer-booking-meta"><span>{request.reference}</span><span className={`customer-status customer-status--${request.status}`}>{request.status}</span></div><h3>{request.vehicle_name}</h3><p>{locationNames[request.pickup_location] || request.pickup_location} · {formatDate(request.pickup)} – {formatDate(request.returnDate)}</p></div>
        <Link className="customer-booking-link" href={`/pilot/requests/${request.id}`}>View request<span className="sr-only"> {request.reference}</span></Link>
      </article>)}</div> : <div className="customer-empty"><strong>No operator requests yet.</strong><p>Choose an operator vehicle to send a request that will be saved here.</p><Link className="account-entry-return" href="/pilot">Explore operator vehicles</Link></div>}
    </section>}
    <div className="customer-section-heading"><p className="booking-kicker">Journey plans</p><h2 id="customer-bookings-title">Your plans.</h2><p>Plans completed in this browser session appear here. They do not reserve a vehicle; only operator requests are saved to your account.</p></div>
    {savedPlans.length ? <div className="customer-booking-list">{savedPlans.map((plan) => {
      const quote = calculateQuote(plan.journey, plan.extras);
      if (!quote) return null;
      return <article className="customer-booking-row" key={plan.reference}>
        <div className="customer-booking-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 280px" style={{ objectPosition: quote.car.position }} /></div>
        <div className="customer-booking-details"><div className="customer-booking-meta"><span>{plan.reference.slice(-12)}</span><span className="customer-status">Saved plan</span></div><h3>{quote.car.name}</h3><p>{locationNames[plan.journey.location]} · {formatDate(plan.journey.pickup)} – {formatDate(plan.journey.returnDate)}</p><strong>{naira(quote.total)} <small>estimated total</small></strong></div>
        <Link className="customer-booking-link" href={`/booking/confirmation?plan=${encodeURIComponent(plan.reference)}`}>View plan<span className="sr-only"> for {quote.car.name}</span></Link>
      </article>;
    })}</div> : <div className="customer-empty"><strong>No saved plans in this browser session.</strong><p>Explore the collection to plan a journey, or send an operator request above.</p></div>}
    {process.env.NEXT_PUBLIC_SHOW_SAMPLE_JOURNEYS === 'true' && <><div className="customer-filters" role="group" aria-label="Filter bookings">{filters.map((item) => <button key={item.value} type="button" className={filter === item.value ? 'is-active' : ''} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
    {!bookings ? <p className="customer-empty" role="status">Loading journeys…</p> : shown.length ? <div className="customer-booking-list">{shown.map((booking) => {
      const car = carById(booking.carId);
      if (!car) return null;
      return <article className="customer-booking-row" key={booking.id}>
        <div className="customer-booking-photo"><Image src={car.image} alt={car.alt} fill sizes="(max-width: 700px) 100vw, 280px" style={{ objectPosition: car.position }} /></div>
        <div className="customer-booking-details"><div className="customer-booking-meta"><span>{booking.id}</span><span className={`customer-status customer-status--${booking.status}`}>{booking.status}</span></div><h3>{car.name}</h3><p>{locationNames[booking.location]} · {formatDate(booking.pickup)} – {formatDate(booking.returnDate)}</p><strong>{naira(demoBookingAmount(booking))} <small>estimated total</small></strong></div>
        <Link className="customer-booking-link" href={`/account/bookings/${booking.id}`}>View details<span className="sr-only"> for {car.name}</span></Link>
      </article>;
    })}</div> : <div className="customer-empty"><strong>No example journeys here.</strong></div>}</>}
  </section>;
}
