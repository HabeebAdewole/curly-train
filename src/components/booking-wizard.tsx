'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateRangePicker } from '@/components/date-range-picker';
import { calculateQuote, extrasCatalog, pounds, validExtraIds, validateDriver, validateJourney, type Driver, type ExtraId, type FieldErrors, type Journey } from '@/lib/booking';
import { exampleBlockedDates, formatDate, rentalDays } from '@/lib/dates';
import { fleet, type Car } from '@/lib/fleet';
import { locations, locationNames } from '@/lib/locations';
import { demoCheckoutKey, type DemoCheckout } from '@/lib/demo-checkout';
import type { PaymentMode } from '@/lib/payment-mode';

const steps = ['Journey', 'Extras', 'Driver', 'Review'] as const;
const emptyDriver: Driver = { fullName: '', email: '', phone: '', licenceCountry: '' };

export function BookingWizard({ car, initialPickup, initialReturn, initialLocation, canceled, checkoutMode }: { car: Car; initialPickup: string; initialReturn: string; initialLocation: string; canceled: boolean; checkoutMode: PaymentMode }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [journey, setJourney] = useState<Journey>({ carId: car.id, pickup: initialPickup, returnDate: initialReturn, location: initialLocation });
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [driver, setDriver] = useState<Driver>(emptyDriver);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const blocked = exampleBlockedDates(fleet.findIndex((item) => item.id === car.id));
  const journeyValid = Object.keys(validateJourney(journey)).length === 0;
  const quote = journeyValid ? calculateQuote(journey, extras) : null;

  function next() {
    if (step === 0) {
      const found = validateJourney(journey);
      setErrors(found);
      if (Object.keys(found).length) return;
    }
    if (step === 2) {
      const found = validateDriver(driver);
      setErrors(found);
      if (Object.keys(found).length) return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleExtra(id: ExtraId) {
    setExtras((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function beginTestCheckout() {
    const journeyErrors = validateJourney(journey);
    const driverErrors = validateDriver(driver);
    if (Object.keys(journeyErrors).length) { setErrors(journeyErrors); setStep(0); return; }
    if (Object.keys(driverErrors).length) { setErrors(driverErrors); setStep(2); return; }
    if (!agreed) { setErrors({ agreement: 'Acknowledge that this is a portfolio demonstration.' }); return; }
    setPending(true);
    setCheckoutError('');
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...journey, extras: validExtraIds(extras), driver }) });
      const data: { mode?: PaymentMode; url?: string; reference?: string; journey?: Journey; extras?: ExtraId[]; error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || 'Demo checkout could not start. Try again.');
      if (data.mode === 'simulation' && data.reference && data.journey && data.extras) {
        const checkout: DemoCheckout = { reference: data.reference, journey: data.journey, extras: data.extras, status: 'pending' };
        sessionStorage.setItem(demoCheckoutKey, JSON.stringify(checkout));
        router.push('/booking/demo-checkout');
      } else if (data.mode === 'flutterwave' && data.url) {
        window.location.assign(data.url);
      } else throw new Error('Demo checkout could not start. Try again.');
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Checkout could not start. Try again.');
      setPending(false);
    }
  }

  const days = rentalDays(journey.pickup, journey.returnDate);
  return <>
    <div className="booking-heading"><p className="booking-kicker">Plan your drive</p><h1>{step === 0 ? 'Set the route.' : step === 1 ? 'Make it yours.' : step === 2 ? 'Who is driving?' : 'Review the journey.'}</h1><p>Four clear steps from car choice to {checkoutMode === 'simulation' ? 'a simulated checkout' : 'test checkout'}.</p></div>
    {canceled && <p className="booking-banner" role="status">{checkoutMode === 'simulation' ? 'The checkout simulation' : 'Test checkout'} was canceled. No payment was made; you can continue from here.</p>}
    <nav className="booking-progress" aria-label="Booking steps">{steps.map((name, index) => <button key={name} type="button" onClick={() => { if (index < step) { setErrors({}); setStep(index); } }} disabled={index > step} aria-current={index === step ? 'step' : undefined} className={index === step ? 'is-current' : index < step ? 'is-complete' : ''}><span>{String(index + 1).padStart(2, '0')}</span>{name}</button>)}</nav>
    <div className="booking-layout">
      <section className="booking-main" aria-label={`${steps[step]} details`}>
        {step === 0 && <>
          <div className="booking-section-head"><h2>When and where.</h2><p>Choose your pickup location and travel dates. Return to the same location for this demo.</p></div>
          <div className="booking-field"><label htmlFor="booking-location">Pickup and return location</label><select id="booking-location" value={journey.location} onChange={(event) => { setJourney((current) => ({ ...current, location: event.target.value })); setErrors((current) => ({ ...current, location: undefined })); }} aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? 'location-error' : undefined}><option value="">Choose a location</option>{locations.map((location) => <option key={location.value} value={location.value}>{location.label}</option>)}</select>{errors.location && <p className="booking-field-error" id="location-error">{errors.location}</p>}</div>
          <div className="booking-field"><span className="booking-label">Pickup and return dates</span><DateRangePicker pickup={journey.pickup} returnDate={journey.returnDate} blocked={blocked} onChange={(pickup, returnDate) => { setJourney((current) => ({ ...current, pickup, returnDate })); setErrors((current) => ({ ...current, pickup: undefined, returnDate: undefined })); }} compact />{(errors.pickup || errors.returnDate) && <p className="booking-field-error" role="alert">{errors.pickup || errors.returnDate}</p>}</div>
          <p className="booking-fine-print">This demonstration supports journeys of up to 28 calendar days. Struck-through dates are example unavailable days, not live fleet data.</p>
        </>}
        {step === 1 && <>
          <div className="booking-section-head"><h2>The useful extras.</h2><p>Add only what makes this trip easier. Each option is priced per day in this demo.</p></div>
          <div className="booking-extras">{extrasCatalog.map((extra) => <label key={extra.id} className={`booking-extra${extras.includes(extra.id) ? ' is-selected' : ''}`}><input type="checkbox" checked={extras.includes(extra.id)} onChange={() => toggleExtra(extra.id)} /><span className="booking-extra-copy"><strong>{extra.name}</strong><small>{extra.description}</small></span><span className="booking-extra-price">+{pounds(extra.dailyRate)}<small>per day</small></span></label>)}</div>
          <p className="booking-fine-print">These are example add-ons and prices for a demonstration; no equipment or additional driver is actually reserved.</p>
        </>}
        {step === 2 && <>
          <div className="booking-section-head"><h2>Driver details.</h2><p>We use these details to demonstrate checkout validation. Please use test information, not your real licence number.</p></div>
          <div className="booking-driver-grid">
            <div className="booking-field booking-field--wide"><label htmlFor="driver-name">Full name</label><input id="driver-name" autoComplete="name" value={driver.fullName} onChange={(event) => { setDriver((current) => ({ ...current, fullName: event.target.value })); setErrors((current) => ({ ...current, fullName: undefined })); }} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'driver-name-error' : undefined} placeholder="First and last name" />{errors.fullName && <p id="driver-name-error" className="booking-field-error">{errors.fullName}</p>}</div>
            <div className="booking-field"><label htmlFor="driver-email">Email address</label><input id="driver-email" type="email" autoComplete="email" value={driver.email} onChange={(event) => { setDriver((current) => ({ ...current, email: event.target.value })); setErrors((current) => ({ ...current, email: undefined })); }} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'driver-email-error' : undefined} placeholder="you@example.com" />{errors.email && <p id="driver-email-error" className="booking-field-error">{errors.email}</p>}</div>
            <div className="booking-field"><label htmlFor="driver-phone">Phone number</label><input id="driver-phone" type="tel" autoComplete="tel" value={driver.phone} onChange={(event) => { setDriver((current) => ({ ...current, phone: event.target.value })); setErrors((current) => ({ ...current, phone: undefined })); }} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'driver-phone-error' : undefined} placeholder="+44 7700 900000" />{errors.phone && <p id="driver-phone-error" className="booking-field-error">{errors.phone}</p>}</div>
            <div className="booking-field booking-field--wide"><label htmlFor="driver-country">Licence issuing country</label><input id="driver-country" autoComplete="country-name" value={driver.licenceCountry} onChange={(event) => { setDriver((current) => ({ ...current, licenceCountry: event.target.value })); setErrors((current) => ({ ...current, licenceCountry: undefined })); }} aria-invalid={Boolean(errors.licenceCountry)} aria-describedby={errors.licenceCountry ? 'driver-country-error' : undefined} placeholder="e.g. United Kingdom" />{errors.licenceCountry && <p id="driver-country-error" className="booking-field-error">{errors.licenceCountry}</p>}</div>
          </div>
          <p className="booking-fine-print">Use example details. This form sends them to our server for validation. {checkoutMode === 'simulation' ? 'The simulation keeps only the journey and extras in this browser tab; no details are sent to a payment provider.' : 'Your email, journey, and test amount are then sent to Flutterwave.'} No licence number, identity document, or card details are collected here, and no booking record is saved.</p>
        </>}
        {step === 3 && <>
          <div className="booking-section-head"><h2>One last look.</h2><p>Check the route and illustrative amount before {checkoutMode === 'simulation' ? 'opening the local checkout simulation' : 'moving to Flutterwave’s hosted test checkout'}.</p></div>
          <dl className="booking-review"><div><dt>Car</dt><dd>{car.name}</dd></div><div><dt>Collection</dt><dd>{locationNames[journey.location] || '—'} · {formatDate(journey.pickup)}</dd></div><div><dt>Return</dt><dd>{locationNames[journey.location] || '—'} · {formatDate(journey.returnDate)}</dd></div><div><dt>Duration</dt><dd>{days} {days === 1 ? 'day' : 'days'}</dd></div><div><dt>Extras</dt><dd>{extras.length ? extrasCatalog.filter((extra) => extras.includes(extra.id)).map((extra) => extra.name).join(', ') : 'None'}</dd></div><div><dt>Driver</dt><dd>{driver.fullName}<br />{driver.email}</dd></div></dl>
          <label className="booking-agreement"><input type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); setErrors((current) => ({ ...current, agreement: undefined })); }} /><span>I understand this is a portfolio demonstration. {checkoutMode === 'simulation' ? 'No payment will be made or vehicle reserved.' : 'A test payment will not reserve a real vehicle.'}</span></label>{errors.agreement && <p className="booking-field-error" role="alert">{errors.agreement}</p>}
          <p className="booking-fine-print">{checkoutMode === 'simulation' ? 'No card form or payment provider is involved. The next screen lets you complete or cancel a sample checkout.' : 'Flutterwave handles the card form. Use only Flutterwave test card details; no real money will move.'}</p>
        </>}
        <div className="booking-actions">{step > 0 && <button type="button" className="booking-back" onClick={() => { setErrors({}); setStep((current) => current - 1); }}>Back</button>}{step < 3 ? <button type="button" className="booking-next" onClick={next}>Continue to {steps[step + 1].toLowerCase()}</button> : <button type="button" className="booking-next" onClick={beginTestCheckout} disabled={pending}>{pending ? 'Opening checkout…' : checkoutMode === 'simulation' ? 'Continue to demo checkout' : 'Continue to Flutterwave test checkout'}</button>}</div>
        {checkoutError && <p className="booking-checkout-error" role="alert">{checkoutError}</p>}
      </section>
      <aside className="booking-summary" aria-label="Price summary"><div className="booking-summary-photo"><Image src={car.image} alt={car.alt} fill sizes="(max-width: 900px) 100vw, 400px" style={{ objectPosition: car.position }} /></div><p className="booking-summary-label">Your drive</p><h2>{car.name}</h2><p className="booking-summary-spec">{car.category} · {car.seats} seats · {car.transmission}</p><div className="booking-summary-lines"><div><span>Car · {quote?.days || '—'} days × {pounds(car.dailyRate)}</span><strong>{quote ? pounds(quote.carAmount) : '—'}</strong></div>{quote?.extras.map((extra) => <div key={extra.id}><span>{extra.name} · {quote.days} days</span><strong>{pounds(extra.amount)}</strong></div>)}</div><div className="booking-summary-total"><span>{checkoutMode === 'simulation' ? 'Illustrative total' : 'Test total'}</span><strong>{quote ? pounds(quote.total) : '—'}</strong></div><p>Illustrative amount in GBP. No live inventory or real booking is connected.</p></aside>
    </div>
    <div className="booking-mobile-total" role="status"><span>{checkoutMode === 'simulation' ? 'Illustrative total' : 'Test total'}</span><strong>{quote ? pounds(quote.total) : '—'}</strong></div>
  </>;
}
