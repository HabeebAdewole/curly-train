import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark" href="/">morrow.</Link>
      <p>A concept car rental experience in London.</p>
      <Link href="#top">Back to top</Link>
    </footer>
  );
}
