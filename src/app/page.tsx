import Link from 'next/link';
import Image from 'next/image';
import { BrandExplorer } from '@/components/brand-explorer';
import { CollectionGallery } from '@/components/collection-gallery';
import { MotionVideo } from '@/components/motion-video';
import { SearchForm } from '@/components/search-form';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { HomeMotion } from '@/components/home-motion';

export default function Home() {
  return (
    <main id="top">
      <HomeMotion />
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <SiteHeader />
        <div className="hero-message">
          <h1 id="hero-title">Drive beyond<br />the expected.</h1>
          <p>Explore how a considered rental journey could work across Lagos and Abuja. Vehicles and rates are illustrative while the operator platform is in development.</p>
          <div className="hero-actions">
            <Link className="pill pill--filled" href="#search">Choose your dates</Link>
            <Link className="pill pill--text" href="#cars">Explore the cars</Link>
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

      <section className="city-story" aria-labelledby="city-story-title">
        <Image src="/media/abuja-street.jpg" alt="Cars travelling through Abuja after rain" fill sizes="100vw" />
        <div className="city-story-copy"><span>01 / ABUJA, NIGERIA</span><h2 id="city-story-title">The city is part of the journey.</h2><p>Explore pickup areas close to where your day begins. A future rental operator will confirm what is available.</p></div>
      </section>

      <section className="process-section" id="how-it-works" aria-labelledby="process-title">
        <div className="process-intro"><h2 id="process-title">From first look<br />to a clear plan.</h2><p>Three clear moments for exploring the journey.</p></div>
        <ol className="process-steps">
          <li><span className="process-number">01</span><h3>Set your plans.</h3><p>Choose your pickup location and dates. Start with the journey you have in mind.</p></li>
          <li><span className="process-number">02</span><h3>Make your choice.</h3><p>Compare cars and review an illustrative price before saving a plan.</p></li>
          <li><span className="process-number">03</span><h3>Keep the plan.</h3><p>Review the route and dates you chose. No vehicle is reserved yet.</p></li>
        </ol>
        <Link className="pill pill--dark process-action" href="#search">Choose your dates</Link>
      </section>

      <section className="film-section" id="approach" aria-label="The Rinjo driving experience">
        <MotionVideo />
      </section>

      <section className="closing-section">
        <h2>A good journey begins before you turn the key.</h2>
        <div>
          <p>Choose a car, set your dates and explore the planning flow. Real rental terms will come from each participating operator.</p>
          <Link className="pill pill--filled" href="#search">Plan a drive</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
