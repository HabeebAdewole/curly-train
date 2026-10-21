'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { calculateQuote, naira } from '@/lib/booking';
import { demoCheckoutSnapshot, parseDemoCheckout, subscribeDemoCheckout } from '@/lib/demo-checkout';
import { formatDate } from '@/lib/dates';
import { locationNames } from '@/lib/locations';

export function DemoConfirmation({ reference }: { reference: string }) {
  const raw = useSyncExternalStore(subscribeDemoCheckout, demoCheckoutSnapshot, () => null);
  const checkout = parseDemoCheckout(raw);
  const quote = checkout && checkout.reference === reference && checkout.status === 'completed' ? calculateQuote(checkout.journey, checkout.extras) : null;

  if (!checkout || !quote) return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Your journey</p><h1>Journey details unavailable.</h1><p className="confirmation-lead">Choose a car to start a new plan.</p><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  return <section className="confirmation-wrap">
    <p className="booking-kicker">Your journey</p>
    <h1>Your route, ready.</h1>
    <p className="confirmation-lead">A considered drive starts with the right details.</p>
    <div className="confirmation-detail">
      <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
      <div><p className="booking-kicker">The details</p><h2>{quote.car.name}</h2><dl>
        <div><dt>Collection</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.pickup)}</dd></div>
        <div><dt>Return</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.returnDate)}</dd></div>
        <div><dt>Estimated total</dt><dd>{naira(quote.total)}</dd></div>
      </dl><Link className="booking-next confirmation-link" href="/cars">Explore more cars</Link></div>
    </div>
  </section>;
}
