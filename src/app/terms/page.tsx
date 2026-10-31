import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = { title: 'Site terms — Rinjo' };

export default function TermsPage() {
  return <main className="account-page" id="top"><SiteHeader dark={false} /><div className="privacy-wrap">
    <p className="booking-kicker">Rinjo / Site terms</p><h1>Terms for this site.</h1>
    <p>Updated 30 October 2026. These terms describe use of the current Rinjo website. They are not a vehicle rental agreement.</p>
    <div className="privacy-sections">
      <section><h2>Current service</h2><p>Rinjo is booking software in development. Vehicles, photographs, locations, prices and availability shown here are illustrative and are not offers from a rental operator. Completing the journey flow does not reserve a vehicle or create a rental contract.</p></section>
      <section><h2>Operator request pilots</h2><p>Where a named operator enables a request page, sending an enquiry creates a pending request for its staff to review. A request, WhatsApp message or staff approval does not itself collect payment or replace the operator&apos;s rental agreement. The operator must provide its own confirmed prices, eligibility, cancellation and other rental terms before a binding reservation.</p></section>
      <section><h2>Use of the site</h2><p>You may browse and try the planning flow for lawful purposes. Do not submit another person&apos;s information without their authority or attempt to disrupt the service. Google sign-in is optional for browsing.</p></section>
      <section><h2>Information and accuracy</h2><p>Sample rates, vehicle specifications and imagery may differ from actual rental inventory. Do not rely on them to arrange travel. Brand names identify vehicle makes and do not imply partnership or endorsement.</p></section>
      <section><h2>Future operator terms</h2><p>Before a company offers real rentals here, its legal name, contact details, eligibility rules, confirmed rates, deposit terms, insurance, cancellation conditions and complaint process must be published and accepted separately before any binding booking or payment.</p></section>
      <section><h2>Related information</h2><p>Read our <Link href="/privacy">privacy notice</Link>, <Link href="/cookies">cookie policy</Link> and <Link href="/refunds">payments and refunds page</Link>. These pages will change when the service changes.</p></section>
    </div>
  </div><SiteFooter /></main>;
}
