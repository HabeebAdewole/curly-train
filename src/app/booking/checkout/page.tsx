import type { Metadata } from 'next';
import Link from 'next/link';
import { DemoCheckoutScreen } from '@/components/demo-checkout-screen';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { paymentMode } from '@/lib/payment-mode';

export const metadata: Metadata = { title: 'Checkout — Rinjo' };
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return <main className="confirmation-page" id="top"><SiteHeader dark={false} />
    {paymentMode() === 'simulation' ? <DemoCheckoutScreen /> : <section className="confirmation-wrap confirmation-wrap--message"><p className="booking-kicker">Checkout</p><h1>Checkout is unavailable.</h1><Link className="booking-next confirmation-link" href="/cars">Explore the cars</Link></section>}
    <SiteFooter />
  </main>;
}
