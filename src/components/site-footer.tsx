import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-intro"><Link className="wordmark" href="/">rinjo.</Link><p>Drive plans, thoughtfully made for Lagos and Abuja. Rinjo booking software is in development; no live rentals are offered here yet.</p></div>
        <nav aria-label="Footer navigation"><span>Explore</span><Link href="/#cars">The cars</Link><Link href="/#how-it-works">How it works</Link><Link href="/#search">Plan a drive</Link></nav>
        <nav aria-label="Legal navigation"><span>Information</span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/refunds">Payments &amp; refunds</Link></nav>
        <div className="footer-return"><span>Keep moving</span><Link href="#top">Back to top</Link></div>
      </div>
      <div className="footer-landscape" aria-hidden="true"><span>rinjo.</span></div>
    </footer>
  );
}
