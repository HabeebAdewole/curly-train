import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = { title: 'Privacy — Morrow' };

export default function PrivacyPage() {
  return <main className="account-page" id="top">
    <SiteHeader dark={false} />
    <div className="privacy-wrap">
      <p className="booking-kicker">Morrow / Privacy</p>
      <h1>Your data, clearly.</h1>
      <p>This page explains what happens to information you share while using Morrow.</p>
      <div className="privacy-sections">
        <section><h2>Google sign-in</h2><p>When you sign in, Google provides your name, email address and profile image. Auth.js uses that information to establish your account session. Morrow does not request access to your Google Drive, contacts or other Google data.</p></section>
        <section><h2>Journey and profile details</h2><p>Search and booking steps use your chosen car, location and dates. The checkout route validates the driver details you enter, but the current journey planning flow does not create a stored reservation. Changes to the account journey examples and the phone number and licence country you save in your profile are kept in this browser tab&apos;s session storage.</p></section>
        <section><h2>Payments</h2><p>The current checkout does not collect card details or charge you. If payment processing is added later, this page will be updated before that feature becomes available.</p></section>
        <section><h2>Hosting</h2><p>Morrow runs on Vercel. Standard request information, such as your IP address and browser details, may be processed by the hosting service to deliver the site. You can end your account session by signing out and clear locally saved journey and profile details by clearing this site&apos;s browser data.</p></section>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
