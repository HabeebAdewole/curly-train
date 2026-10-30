import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = { title: 'Payments and refunds — Rinjo' };

export default function RefundsPage() {
  return <main className="account-page" id="top"><SiteHeader dark={false} /><div className="privacy-wrap">
    <p className="booking-kicker">Rinjo / Payments and refunds</p><h1>Payments and refunds.</h1>
    <p>Updated 30 October 2026. The current site does not take rental payments or create real reservations.</p>
    <div className="privacy-sections">
      <section><h2>Current checkout</h2><p>Completing a journey plan is not a purchase. No card details are requested and no rental payment is collected by the current public flow. There is therefore no payment on this site to refund.</p></section>
      <section><h2>Before live bookings</h2><p>A participating rental company must publish its confirmed prices, taxes, deposits, cancellation rules, refund method and timing before customers can pay or accept a rental agreement. Any cancellation charge must comply with applicable consumer law. Future policies will not apply to plans created in the current flow.</p></section>
      <section><h2>If you believe you were charged</h2><p>Check the merchant name on your bank or card statement. The current Rinjo site does not have a live rental payment account. Contact your bank or the named merchant about an unexpected charge. Do not send card numbers through this website.</p></section>
      <section><h2>Related information</h2><p>See the <Link href="/terms">site terms</Link> and <Link href="/privacy">privacy notice</Link>.</p></section>
    </div>
  </div><SiteFooter /></main>;
}
