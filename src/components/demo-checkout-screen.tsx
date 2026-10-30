'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { calculateQuote, naira } from '@/lib/booking';
import { demoCheckoutKey, demoCheckoutSnapshot, parseDemoCheckout, subscribeDemoCheckout, type DemoCheckout } from '@/lib/demo-checkout';
import { formatDate } from '@/lib/dates';
import { locationNames } from '@/lib/locations';

export function DemoCheckoutScreen() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeDemoCheckout, demoCheckoutSnapshot, () => null);
  const checkout = parseDemoCheckout(raw);

  if (!checkout || checkout.status !== 'pending') return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Checkout</p><h1>No journey is in progress.</h1><p className="confirmation-lead">Choose a car and complete the journey details to continue.</p><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  const quote = calculateQuote(checkout.journey, checkout.extras);
  if (!quote) return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Checkout</p><h1>This journey needs a fresh start.</h1><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>;

  function complete() {
    if (!checkout) return;
    sessionStorage.setItem(demoCheckoutKey, JSON.stringify({ ...checkout, status: 'completed' } satisfies DemoCheckout));
    router.push(`/booking/confirmation?plan=${encodeURIComponent(checkout.reference)}`);
  }

  function cancel() {
    if (!checkout) return;
    sessionStorage.removeItem(demoCheckoutKey);
    const query = new URLSearchParams({ pickup: checkout.journey.pickup, return: checkout.journey.returnDate, location: checkout.journey.location, canceled: '1' });
    router.push(`/book/${encodeURIComponent(checkout.journey.carId)}?${query}`);
  }

  return <section className="confirmation-wrap demo-checkout-wrap">
    <p className="booking-kicker">Checkout</p>
    <h1>Make it yours.</h1>
    <p className="confirmation-lead">Take one final look at the journey plan. This step does not charge you or reserve a car.</p>
    <div className="confirmation-detail">
      <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
      <div>
        <p className="booking-kicker">Your journey</p>
        <h2>{quote.car.name}</h2>
        <dl>
          <div><dt>Collection</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.pickup)}</dd></div>
          <div><dt>Return</dt><dd>{locationNames[checkout.journey.location]} · {formatDate(checkout.journey.returnDate)}</dd></div>
          <div><dt>Duration</dt><dd>{quote.days} {quote.days === 1 ? 'day' : 'days'}</dd></div>
          <div><dt>Estimated total</dt><dd>{naira(quote.total)}</dd></div>
        </dl>
        <div className="demo-checkout-actions"><button className="booking-next" type="button" onClick={complete}>Finish planning</button><button className="booking-back" type="button" onClick={cancel}>Back to journey</button></div>
      </div>
    </div>
  </section>;
}
