import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type Stripe from 'stripe';
import { calculateQuote, pounds, validExtraIds } from '@/lib/booking';
import { formatDate } from '@/lib/dates';
import { locationNames } from '@/lib/locations';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { testStripe } from '@/lib/stripe-server';

export const metadata: Metadata = { title: 'Test checkout result — Morrow' };
export const dynamic = 'force-dynamic';

async function retrieveTestSession(stripe: Stripe, id: string) {
  try { return await stripe.checkout.sessions.retrieve(id); }
  catch { return null; }
}

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
  const value = (await searchParams).session_id;
  const sessionId = typeof value === 'string' && /^cs_test_[A-Za-z0-9_]+$/.test(value) ? value : '';
  const stripe = testStripe();
  if (!sessionId || !stripe) return <ConfirmationShell title="We could not verify this test checkout." detail="A valid Stripe test session and test key are needed to show the result." />;

  const session = await retrieveTestSession(stripe, sessionId);
  if (!session) return <ConfirmationShell title="We could not verify this test checkout." detail="The Stripe test session could not be retrieved. No booking is shown as complete." />;

  const values = session.metadata || {};
  const journey = { carId: values.carId || '', pickup: values.pickup || '', returnDate: values.returnDate || '', location: values.location || '' };
  const extras = validExtraIds((values.extras || '').split(',').filter(Boolean));
  const quote = calculateQuote(journey, extras);
  const verified = !session.livemode && session.payment_status === 'paid' && session.currency === 'gbp' && quote !== null && quote.total * 100 === session.amount_total && Boolean(locationNames[journey.location]);
  if (!verified || !quote) return <ConfirmationShell title="Test payment is not confirmed." detail="Stripe has not reported a matching paid test session. No booking is shown as complete." />;

  return <main className="confirmation-page" id="top">
    <SiteHeader dark={false} />
    <section className="confirmation-wrap">
      <p className="booking-kicker">Stripe test payment complete</p>
      <h1>Test payment complete.</h1>
      <p className="confirmation-lead">Your test payment succeeded. This portfolio experience has not reserved a real vehicle.</p>
      <div className="confirmation-detail">
        <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
        <div>
          <p className="booking-kicker">Your demonstration journey</p>
          <h2>{quote.car.name}</h2>
          <dl>
            <div><dt>Collection</dt><dd>{locationNames[journey.location]} · {formatDate(journey.pickup)}</dd></div>
            <div><dt>Return</dt><dd>{locationNames[journey.location]} · {formatDate(journey.returnDate)}</dd></div>
            <div><dt>Test amount</dt><dd>{pounds(quote.total)}</dd></div>
            <div><dt>Stripe reference</dt><dd>{session.id.slice(-12)}</dd></div>
          </dl>
          <Link className="booking-next confirmation-link" href="/cars">Explore more cars</Link>
        </div>
      </div>
      <p className="booking-fine-print">This is a verified Stripe test payment only. No real rental, inventory hold, or booking record was created.</p>
    </section>
    <SiteFooter />
  </main>;
}

function ConfirmationShell({ title, detail }: { title: string; detail: string }) {
  return <main className="confirmation-page" id="top">
    <SiteHeader dark={false} />
    <section className="confirmation-wrap confirmation-wrap--message">
      <p className="booking-kicker">Checkout status</p>
      <h1>{title}</h1>
      <p className="confirmation-lead">{detail}</p>
      <Link className="booking-next confirmation-link" href="/cars">Back to the cars</Link>
    </section>
    <SiteFooter />
  </main>;
}
