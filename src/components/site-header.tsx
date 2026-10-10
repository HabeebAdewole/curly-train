import Link from 'next/link';

export function SiteHeader({ dark = true }: { dark?: boolean }) {
  return (
    <header className={`site-header ${dark ? 'site-header--dark' : 'site-header--light'}`}>
      <Link className="wordmark" href="/" aria-label="Morrow home">morrow.</Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/#cars">The cars</Link>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#search">Book a car</Link>
      </nav>
      <div className="header-end">
        <span className="header-location">London, UK</span>
        <Link className="pill pill--outline" href="/#search">Find your drive</Link>
      </div>
    </header>
  );
}
