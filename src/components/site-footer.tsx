import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" href="/">rinjo.</Link>
      <p>Rinjo booking software in development · Lagos and Abuja focus. No live rentals are offered here yet.</p>
      <nav aria-label="Footer navigation"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/refunds">Payments &amp; refunds</Link><Link href="#top">Back to top</Link></nav>
    </footer>
  );
}
