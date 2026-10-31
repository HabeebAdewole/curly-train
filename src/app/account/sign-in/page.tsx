import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { authReady } from '@/lib/auth-ready';

export const metadata: Metadata = { title: 'Your account — Rinjo' };
export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const requested = (await searchParams).callbackUrl;
  const destination = requested && requested.length < 160 && /^\/pilot\/[a-z0-9/-]+$/.test(requested) ? requested : '/account/bookings';
  const ready = authReady();
  if (ready && (await auth())?.user) redirect(destination);

  return <main className="account-page" id="top">
    <SiteHeader dark={false} />
    <div className="account-entry-layout">
      <section className="account-entry-main">
        <p className="booking-kicker">YOUR RINJO SPACE</p>
        <h1>Pick up where<br />you left off.</h1>
        <p className="account-entry-intro">Your cars and journey plans, ready when you are.</p>
        {ready ? <form action={async () => {
          'use server';
          await signIn('google', { redirectTo: destination });
        }}><button type="submit" className="booking-next account-entry-submit">Continue with Google</button></form> : <div className="account-setup-note" role="status"><strong>Sign-in is temporarily unavailable.</strong><p>Please come back shortly. You can still explore the collection.</p></div>}
        <Link className="account-entry-return" href="/cars">Explore the cars</Link>
      </section>
      <figure className="account-entry-visual">
        <div className="account-art-disc" aria-hidden="true" />
        <svg className="account-art-route" viewBox="0 0 620 590" fill="none" aria-hidden="true"><path d="M78 445C140 400 111 286 204 280C282 276 290 387 384 335C473 286 418 147 542 112" stroke="#315343" strokeWidth="2" strokeDasharray="7 8" /><circle cx="78" cy="445" r="8" fill="#18372A" stroke="#EAF2E9" strokeWidth="4" /><circle cx="542" cy="112" r="8" fill="#18372A" stroke="#EAF2E9" strokeWidth="4" /></svg>
        <span className="account-art-label account-art-label--top" aria-hidden="true"><small>01 / KEEP THE PLAN</small><strong>ONE PLACE.<br />EVERY JOURNEY.</strong></span>
        <div className="account-art-car"><Image src="/media/mercedes-s-class.webp" alt="Graphite Mercedes-Benz S-Class on a pale studio backdrop" width={1400} height={933} sizes="(max-width: 900px) 100vw, 52vw" priority /></div>
        <span className="account-art-label account-art-label--bottom" aria-hidden="true"><span className="account-art-point" /> LAGOS · ABUJA</span>
        <figcaption>Make the next drive easier to find.</figcaption>
      </figure>
    </div>
    <SiteFooter />
  </main>;
}
