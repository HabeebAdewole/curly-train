import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CustomerSignOut } from '@/components/customer-sign-out';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { authReady } from '@/lib/auth-ready';

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!authReady()) redirect('/account/sign-in');
  const session = await auth();
  if (!session?.user?.email) redirect('/account/sign-in');

  return <main className="account-page" id="top">
    <SiteHeader dark={false} />
    <div className="customer-wrap">
      <div className="customer-heading"><p className="booking-kicker">Your Morrow space</p><h1>The journey, considered.</h1><p>Welcome, {session.user.name || 'driver'}.</p></div>
      <div className="customer-layout">
        <nav className="customer-nav" aria-label="Customer account">
          <Link href="/account/bookings">My bookings</Link>
          <Link href="/account/profile">Profile & driver details</Link>
          <CustomerSignOut email={session.user.email} />
        </nav>
        <div className="customer-content">{children}</div>
      </div>
    </div>
    <SiteFooter />
  </main>;
}
