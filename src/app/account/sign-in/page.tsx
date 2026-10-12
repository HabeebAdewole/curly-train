import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { authReady } from '@/lib/auth-ready';

export const metadata: Metadata = { title: 'Your account — Morrow' };
export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  const ready = authReady();
  if (ready && (await auth())?.user) redirect('/account/bookings');

  return <main className="account-page" id="top">
    <SiteHeader dark={false} />
    <div className="account-entry-layout">
      <section className="account-entry-main">
        <p className="booking-kicker">Your Morrow space</p>
        <h1>The road ahead, all in one place.</h1>
        <p className="account-entry-intro">Sign in with Google to explore your Morrow space.</p>
        {ready ? <form action={async () => {
          'use server';
          await signIn('google', { redirectTo: '/account/bookings' });
        }}><button type="submit" className="booking-next account-entry-submit">Continue with Google</button></form> : <div className="account-setup-note" role="status"><strong>Google sign-in is waiting for setup.</strong><p>Add the Auth.js and Google OAuth values from <code>.env.example</code> to your ignored <code>.env.local</code>, then restart the app.</p></div>}
        <Link className="account-entry-return" href="/cars">Explore the cars</Link>
      </section>
      <figure className="account-entry-visual"><Image src="/media/mercedes-s-class.webp" alt="Graphite Mercedes-Benz S-Class against a pale backdrop" fill sizes="(max-width: 900px) 100vw, 48vw" /><figcaption><span>01 / YOUR JOURNEYS</span><strong>Good to have the details in one place.</strong></figcaption></figure>
    </div>
    <SiteFooter />
  </main>;
}
