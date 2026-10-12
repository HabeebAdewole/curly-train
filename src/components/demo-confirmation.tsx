'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { calculateQuote, pounds } from '@/lib/booking';
import { demoCheckoutSnapshot, parseDemoCheckout, subscribeDemoCheckout } from '@/lib/demo-checkout';
import { formatDate } from '@/lib/dates';
import { locationNames } from '@/lib/locations';

export function DemoConfirmation({ reference }: { reference: string }) {
  const raw = useSyncExternalStore(subscribeDemoCheckout, demoCheckoutSnapshot, () => null);
  const checkout = parseDemoCheckout(raw);
  const quote = checkout && checkout.reference === reference && checkout.status === 'completed' ? calculateQuote(checkout.journey, checkout.extras) : null;

  if (!checkout || !quote) return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Local simulation</p><h1>No completed demo checkout found.</h1><p className="confirmation-lead">This result is stored only in the browser tab where the simulation was completed.</p><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  return <section className="confirmation-wrap">
    <p className="booking-kicker">Simulation complete · No payment made</p>
    <h1>Demo journey complete.</h1>
    <p className="confirmation-lead">You completed the sample checkout. No money moved and no vehicle was reserved.</p>
    <div className="confirmation-detail">
      <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
      <div><p className="booking-kicker">Your demonstration journey</p><h2>{quote.car.name}</h2><dl>
        <div><dt>Collection</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.pickup)}</dd></div>
        <div><dt>Return</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.returnDate)}</dd></div>
        <div><dt>Illustrative total</dt><dd>{pounds(quote.total)}</dd></div>
        <div><dt>Demo reference</dt><dd>{reference.slice(-12)}</dd></div>
      </dl><Link className="booking-next confirmation-link" href="/cars">Explore more cars</Link></div>
    </div>
    <p className="booking-fine-print">This result exists only in this browser tab. It is not a payment receipt, reservation, or entry in My bookings.</p>
  </section>;
}
