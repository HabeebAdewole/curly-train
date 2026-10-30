import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = { title: 'Cookie policy — Rinjo' };

export default function CookiesPage() {
  return <main className="account-page" id="top"><SiteHeader dark={false} /><div className="privacy-wrap">
    <p className="booking-kicker">Rinjo / Cookies</p><h1>Cookies and local storage.</h1>
    <p>Updated 30 October 2026. This page describes the current site. We will update it before adding analytics, advertising or another optional tracker.</p>
    <div className="privacy-sections">
      <section><h2>Essential sign-in cookies</h2><p>If you choose Google sign-in, Auth.js uses cookies needed to establish and protect your session. They are not used for advertising. Cookie names may vary between local and secure production connections. You can remove them by signing out or clearing site data in your browser.</p></section>
      <section><h2>Browser session storage</h2><p>The planning flow keeps your car, dates, location and selected extras in this browser tab. Account journey examples may keep your edits for this session. A session flag remembers when you close the cookie notice. These items are not analytics identifiers and are cleared when the browser session ends or you clear site data.</p></section>
      <section><h2>Optional tracking</h2><p>The application does not currently load advertising pixels, analytics scripts or third-party embeds. There is no optional tracking category to accept. If that changes, we will ask you to accept or reject it before it runs and provide a way to change your choice.</p></section>
      <section><h2>Your controls</h2><p>You can browse without signing in, sign out or clear cookies and site data in your browser settings. Blocking essential sign-in cookies may prevent account pages from working. See the <Link href="/privacy">privacy notice</Link>.</p></section>
    </div>
  </div><SiteFooter /></main>;
}
