'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { calculateQuote, pounds } from '@/lib/booking';
import { demoCheckoutKey, demoCheckoutSnapshot, parseDemoCheckout, subscribeDemoCheckout, type DemoCheckout } from '@/lib/demo-checkout';
import { formatDate } from '@/lib/dates';
import { locationNames } from '@/lib/locations';

export function DemoCheckoutScreen() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDemoCheckout, demoCheckoutSnapshot, () => null);
  const checkout = parseDemoCheckout(raw);

  if (!checkout || checkout.status !== 'pending') return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Local simulation</p><h1>No demo checkout is open.</h1><p className="confirmation-lead">Start with a car and complete the four booking steps.</p><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  const quote = calculateQuote(checkout.journey, checkout.extras);
  if (!quote) return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Local simulation</p><h1>This sample journey is no longer available.</h1><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  function complete() {
    if (!checkout) return;
    sessionStorage.setItem(demoCheckoutKey, JSON.stringify({ ...checkout, status: 'completed' } satisfies DemoCheckout));
    router.push(`/booking/confirmation?demo=${encodeURIComponent(checkout.reference)}`);
  }

  function cancel() {
    if (!checkout) return;
    sessionStorage.removeItem(demoCheckoutKey);
    const query = new URLSearchParams({ pickup: checkout.journey.pickup, return: checkout.journey.returnDate, location: checkout.journey.location, canceled: '1' });
    router.push(`/book/${encodeURIComponent(checkout.journey.carId)}?${query}`);
  }

  return <section className="confirmation-wrap demo-checkout-wrap">
    <p className="booking-kicker">Local checkout simulation</p>
    <h1>Finish the demonstration.</h1>
    <p className="confirmation-lead">This screen demonstrates the final checkout decision. No payment provider, card details, money, or vehicle reservation is involved.</p>
    <div className="confirmation-detail">
      <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
      <div>
        <p className="booking-kicker">Your sample journey</p>
        <h2>{quote.car.name}</h2>
        <dl>
          <div><dt>Collection</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.pickup)}</dd></div>
          <div><dt>Return</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.returnDate)}</dd></div>
          <div><dt>Duration</dt><dd>{quote.days} {quote.days === 1 ? 'day' : 'days'}</dd></div>
          <div><dt>Illustrative total</dt><dd>{pounds(quote.total)}</dd></div>
        </dl>
        <p className="booking-fine-print">Completing this simulation records its result only in this browser tab. It will not appear as a real booking in your account.</p>
        <div className="demo-checkout-actions"><button className="booking-next" type="button" onClick={complete}>Complete simulation</button><button className="booking-back" type="button" onClick={cancel}>Cancel simulation</button></div>
      </div>
    </div>
  </section>;
}
