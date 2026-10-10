import Link from 'next/link';
import { BrandExplorer } from '@/components/brand-explorer';
import { CollectionGallery } from '@/components/collection-gallery';
import { MotionVideo } from '@/components/motion-video';
import { SearchForm } from '@/components/search-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <main id="top">
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <SiteHeader />
        <div className="hero-message">
          <h1 id="hero-title">Drive beyond<br />the expected.</h1>
          <p>Remarkable cars for the moments that deserve more than a way to get there.</p>
          <div className="hero-actions">
            <Link className="pill pill--filled" href="#cars">Explore the cars</Link>
            <Link className="pill pill--outline" href="#how-it-works">How it works</Link>
          </div>
        </div>
        <SearchForm />
      </section>

      <section className="brands-section" id="brands" aria-labelledby="brands-title">
        <div className="brands-intro">
          <h2 id="brands-title">Start with a name<br />you know.</h2>
          <p>Then find the car that feels right for this journey.</p>
        </div>
        <BrandExplorer />
      </section>

      <section className="collection-section" id="cars" aria-labelledby="collection-title">
        <div className="section-heading">
          <h2 id="collection-title">The right car<br />changes everything.</h2>
          <div><p>From quiet confidence to open-road energy. Find the shape of the journey you have in mind.</p></div>
        </div>
        <CollectionGallery />
      </section>

      <section className="process-section" id="how-it-works" aria-labelledby="process-title">
        <div className="process-intro"><h2 id="process-title">From first look<br />to first mile.</h2><p>Three clear moments between finding your car and taking the wheel.</p></div>
        <ol className="process-steps">
          <li><span className="process-number">01</span><h3>Set your plans.</h3><p>Choose your pickup location and dates. Start with the journey you have in mind.</p></li>
          <li><span className="process-number">02</span><h3>Make your choice.</h3><p>Compare cars, review the details, and see the full cost before you confirm.</p></li>
          <li><span className="process-number">03</span><h3>Take the wheel.</h3><p>Find your booking details in one place, then collect the car and enjoy the drive.</p></li>
        </ol>
        <Link className="underlined-link" href="#search">Start with your dates</Link>
      </section>

      <section className="film-section" id="approach" aria-label="The Morrow driving experience">
        <MotionVideo />
      </section>

      <section className="closing-section">
        <h2>A good journey begins before you turn the key.</h2>
        <div>
          <p>Choose the car that feels right. Set your dates. We’ll make the rest of the experience feel just as considered.</p>
          <Link className="pill pill--outline" href="#search">Find your car</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
