import Link from 'next/link';

export function SiteHeader({ dark = true }: { dark?: boolean }) {
  return (
    <header className={`site-header ${dark ? 'site-header--dark' : 'site-header--light'}`}>
      <Link className="wordmark" href="/" aria-label="Rinjo home">rinjo.</Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/#cars">The cars</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#search">Plan a drive</Link>
      </nav>
      <div className="header-end">
        <span className="header-location">Lagos · Abuja, Nigeria</span>
        <Link className="header-account" href="/account/sign-in">Account</Link>
        <Link className="pill pill--outline" href="/#search">Find your drive</Link>
      </div>
    </header>
  );
}
