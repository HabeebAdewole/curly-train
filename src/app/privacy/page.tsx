import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = { title: 'Privacy — Rinjo' };

export default function PrivacyPage() {
  return <main className="account-page" id="top">
    <SiteHeader dark={false} />
    <div className="privacy-wrap">
      <p className="booking-kicker">Rinjo / Privacy</p>
      <h1>How your data is used.</h1>
      <p>Updated 30 October 2026. This notice describes the current site. It will be revised before a rental operator accepts real bookings through it.</p>
      <div className="privacy-sections">
        <section><h2>Who operates this site</h2><p>Rinjo is booking software in development. No rental operator has been onboarded. A responsible business identity and direct privacy contact must be published before customer data is collected for live bookings.</p></section>
        <section><h2>Google sign-in</h2><p>Sign-in is optional for browsing. If you choose it, Google provides your name, email address and profile image to establish an Auth.js session. We do not request your Google contacts, Drive files or payment details. Google and the hosting provider process information needed for sign-in and delivery.</p></section>
        <section><h2>Journey information</h2><p>Search choices and journey plans use a car, location, dates and selected extras. The current checkout does not create a reservation or take payment. Journey examples and edits are kept in this browser tab&apos;s session storage. Driver identity and licence details are not needed for this planning flow.</p></section>
        <section><h2>Cookies and tracking</h2><p>Authentication may set cookies needed to keep a sign-in session and protect it. We found no advertising pixels, analytics scripts or third-party embeds in the application code. See the <Link href="/cookies">cookie policy</Link>. Optional tracking will need a separate choice before it is enabled.</p></section>
        <section><h2>Hosting and retention</h2><p>Rinjo runs on Vercel, which may process standard request information such as IP address, browser details and access logs. Session storage is cleared when the browser session ends or you clear site data. Signing out ends your account session. A verified retention schedule is required before live bookings.</p></section>
        <section><h2>Your choices and rights</h2><p>You can browse without signing in, sign out, and clear this site&apos;s browser data. Nigerian data protection law provides rights that may include access, correction, erasure and objection, depending on the circumstances. A direct privacy contact must be published before live bookings. You may also contact the <a href="https://ndpc.gov.ng/" rel="noreferrer">Nigeria Data Protection Commission</a>.</p></section>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
