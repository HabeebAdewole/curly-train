import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { naira } from '@/lib/booking';
import { formatDate } from '@/lib/dates';
import { appBaseUrl, confirmedTestJourney, flutterwaveTestKey, verifyTestPayment } from '@/lib/flutterwave-server';
import { locationNames } from '@/lib/locations';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { DemoConfirmation } from '@/components/demo-confirmation';
import { paymentMode } from '@/lib/payment-mode';

export const metadata: Metadata = { title: 'Checkout result — Rinjo' };
export const dynamic = 'force-dynamic';

type ReturnParams = { status?: string | string[]; tx_ref?: string | string[]; transaction_id?: string | string[]; plan?: string | string[] };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<ReturnParams> }) {
  const params = await searchParams;
  if (paymentMode() === 'simulation') {
    const reference = typeof params.plan === 'string' && /^plan-[a-f0-9]{32}$/.test(params.plan) ? params.plan : '';
    return <main className="confirmation-page" id="top"><SiteHeader dark={false} />{reference ? <DemoConfirmation reference={reference} /> : <ConfirmationMessage title="Journey details unavailable." detail="Choose a car to start a new plan." />}<SiteFooter /></main>;
  }
  if (params.status !== 'successful') return <ConfirmationShell title="Test payment was not completed." detail="No booking was created. You can return to the cars and try again." />;

  const reference = typeof params.tx_ref === 'string' && /^rinjo-[a-f0-9]{32}$/.test(params.tx_ref) ? params.tx_ref : '';
  const transactionId = typeof params.transaction_id === 'string' && /^\d{1,20}$/.test(params.transaction_id) ? params.transaction_id : '';
  const key = flutterwaveTestKey();
  if (!reference || !transactionId || !key || !appBaseUrl()) return <ConfirmationShell title="We could not verify this test checkout." detail="A valid Flutterwave test transaction and local setup are required. No booking is shown as complete." />;

  let transaction = null;
  try { transaction = await verifyTestPayment(key, transactionId); } catch { /* Show an unverified state below. */ }
  if (!transaction || Number(transaction.id) !== Number(transactionId)) return <ConfirmationShell title="We could not verify this test checkout." detail="Flutterwave could not confirm this test transaction. No booking is shown as complete." />;

  const confirmed = confirmedTestJourney(transaction, reference);
  if (!confirmed) return <ConfirmationShell title="Test payment is not confirmed." detail="Flutterwave did not report a matching paid NGN test transaction. No booking is shown as complete." />;
  const { journey, quote } = confirmed;

  return <main className="confirmation-page" id="top">
    <SiteHeader dark={false} />
    <section className="confirmation-wrap">
      <p className="booking-kicker">Flutterwave test payment complete</p>
      <h1>Test payment complete.</h1>
      <p className="confirmation-lead">Flutterwave confirmed this test payment. This portfolio experience has not reserved a real vehicle.</p>
      <div className="confirmation-detail">
        <div className="confirmation-photo"><Image src={quote.car.image} alt={quote.car.alt} fill sizes="(max-width: 700px) 100vw, 45vw" style={{ objectPosition: quote.car.position }} /></div>
        <div>
          <p className="booking-kicker">Your demonstration journey</p>
          <h2>{quote.car.name}</h2>
          <dl>
            <div><dt>Collection</dt><dd>{locationNames[journey.location]} · {formatDate(journey.pickup)}</dd></div>
            <div><dt>Return</dt><dd>{locationNames[journey.location]} · {formatDate(journey.returnDate)}</dd></div>
            <div><dt>Test amount</dt><dd>{naira(quote.total)}</dd></div>
            <div><dt>Payment reference</dt><dd>{reference.slice(-12)}</dd></div>
          </dl>
          <Link className="booking-next confirmation-link" href="/cars">Explore more cars</Link>
        </div>
      </div>
      <p className="booking-fine-print">This is a verified Flutterwave test payment only. No real rental, inventory hold, or booking record was created.</p>
    </section>
    <SiteFooter />
  </main>;
}

function ConfirmationShell({ title, detail }: { title: string; detail: string }) {
  return <main className="confirmation-page" id="top">
    <SiteHeader dark={false} />
    <ConfirmationMessage title={title} detail={detail} />
    <SiteFooter />
  </main>;
}

function ConfirmationMessage({ title, detail }: { title: string; detail: string }) {
  return <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Checkout status</p><h1>{title}</h1><p className="confirmation-lead">{detail}</p><Link className="booking-next confirmation-link" href="/cars">Back to the cars</Link></section>;
}
