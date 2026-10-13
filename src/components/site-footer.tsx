import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" href="/">morrow.</Link>
      <p>London, UK · Drive beyond the expected.</p>
      <nav aria-label="Footer navigation"><Link href="/privacy">Privacy</Link><Link href="#top">Back to top</Link></nav>
    </footer>
  );
}
