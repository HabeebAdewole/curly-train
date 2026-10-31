'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { calculateQuote, naira } from '@/lib/booking';
import { parseSavedPlans, savedPlansSnapshot, subscribeSavedPlans } from '@/lib/demo-checkout';
import { formatDate } from '@/lib/dates';
import { locationNames } from '@/lib/locations';

export function DemoConfirmation({ reference }: { reference: string }) {
  const raw = useSyncExternalStore(subscribeSavedPlans, savedPlansSnapshot, () => null);
  const checkout = parseSavedPlans(raw).find((item) => item.reference === reference);
  const quote = checkout ? calculateQuote(checkout.journey, checkout.extras) : null;

  if (!checkout || !quote) return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Your journey</p><h1>Journey details unavailable.</h1><p className="confirmation-lead">Choose a car to start a new plan.</p><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  return <section className="confirmation-wrap">
    <p className="booking-kicker">Your journey</p>
    <h1>Your plan is ready.</h1>
    <p className="confirmation-lead">This plan is saved in your browser session. It is not a rental reservation.</p>
    <div className="confirmation-detail">
      <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
      <div><p className="booking-kicker">The details</p><h2>{quote.car.name}</h2><dl>
        <div><dt>Collection</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.pickup)}</dd></div>
        <div><dt>Return</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.returnDate)}</dd></div>
        <div><dt>Estimated total</dt><dd>{naira(quote.total)}</dd></div>
      </dl><Link className="booking-next confirmation-link" href="/account/bookings">View your plans</Link></div>
    </div>
  </section>;
}
