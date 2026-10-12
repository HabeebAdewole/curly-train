'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { DateRangePicker } from '@/components/date-range-picker';
import { pounds, validateJourney } from '@/lib/booking';
import { canChangeDemoBooking, demoBookingAmount } from '@/lib/customer-bookings';
import { exampleBlockedDates, formatDate, rentalDays } from '@/lib/dates';
import { carById, fleet } from '@/lib/fleet';
import { locations, locationNames } from '@/lib/locations';
import { useDemoBookings } from '@/lib/use-demo-bookings';

export function CustomerBookingDetail({ id, email }: { id: string; email: string }) {
  const { bookings, cancel, changeJourney } = useDemoBookings(email);
  const booking = bookings?.find((item) => item.id === id);
  const car = booking && carById(booking.carId);
  const [editing, setEditing] = useState(false);
  const [pickup, setPickup] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const cancelDialog = useRef<HTMLDialogElement>(null);

  if (!bookings) return <p className="customer-empty" role="status">Loading example journey…</p>;
  if (!booking || !car) return <div className="customer-empty"><strong>Journey not found.</strong><Link className="account-entry-return" href="/account/bookings">Back to examples</Link></div>;

  const editable = canChangeDemoBooking(booking);
  const blocked = exampleBlockedDates(fleet.indexOf(car));
  const quote = demoBookingAmount(booking);

  function beginEdit() {
    setPickup(booking!.pickup);
    setReturnDate(booking!.returnDate);
    setLocation(booking!.location);
    setError('');
    setNotice('');
    setEditing(true);
  }

  function saveEdit() {
    const found = validateJourney({ carId: booking!.carId, pickup, returnDate, location });
    if (Object.keys(found).length) { setError(found.pickup || found.returnDate || found.location || 'Choose a valid journey.'); return; }
    if (!changeJourney(id, pickup, returnDate, location)) { setError('This example journey can no longer be changed.'); return; }
    setEditing(false);
    setNotice('Your example journey was updated in this browser session.');
  }

  function confirmCancel() {
    if (cancel(id)) setNotice('This example journey is now cancelled in this browser session.');
    cancelDialog.current?.close();
  }

  return <section aria-labelledby="customer-detail-title">
    <Link className="back-link" href="/account/bookings">My bookings / {booking.id}</Link>
    <div className="customer-section-heading customer-detail-heading"><p className="booking-kicker">Example journey / {booking.id}</p><h2 id="customer-detail-title">{car.name}.</h2><p>This example booking has no vehicle, payment, or inventory record behind it.</p></div>
    <div className="customer-detail-photo"><Image src={car.image} alt={car.alt} fill sizes="(max-width: 900px) 100vw, 70vw" style={{ objectPosition: car.position }} /></div>
    <div className="customer-detail-grid">
      <div><p className={`customer-status customer-status--${booking.status}`}>{booking.status.toUpperCase()} / DEMONSTRATION</p><h3>The details.</h3></div>
      <dl className="customer-detail-facts"><div><dt>Collection</dt><dd>{locationNames[booking.location]}<br />{formatDate(booking.pickup)}</dd></div><div><dt>Return</dt><dd>{locationNames[booking.location]}<br />{formatDate(booking.returnDate)}</dd></div><div><dt>Duration</dt><dd>{rentalDays(booking.pickup, booking.returnDate)} days</dd></div><div><dt>Extras</dt><dd>{booking.extras.length ? booking.extras.map((extra) => extra === 'additional-driver' ? 'Additional driver' : 'Child seat').join(', ') : 'None'}</dd></div><div><dt>Illustrative total</dt><dd>{pounds(quote)}</dd></div></dl>
    </div>
    {notice && <p className="customer-notice" role="status">{notice}</p>}
    {editable && !editing && <div className="customer-detail-actions"><button type="button" className="booking-next" onClick={beginEdit}>Change example dates</button><button type="button" className="customer-text-button" onClick={() => cancelDialog.current?.showModal()}>Cancel example journey</button></div>}
    {editing && <div className="customer-edit" aria-label="Change example journey"><div className="customer-section-heading"><p className="booking-kicker">Change the plan</p><h3>New dates, same car.</h3><p>Updates affect this browser session only. No real reservation will change.</p></div><div className="booking-field"><label htmlFor="customer-location">Pickup and return location</label><select id="customer-location" value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div className="booking-field"><span className="booking-label">Pickup and return dates</span><DateRangePicker pickup={pickup} returnDate={returnDate} blocked={blocked} onChange={(nextPickup, nextReturn) => { setPickup(nextPickup); setReturnDate(nextReturn); setError(''); }} compact /></div>{error && <p className="booking-field-error" role="alert">{error}</p>}<div className="customer-detail-actions"><button type="button" className="booking-next" onClick={saveEdit}>Save example changes</button><button type="button" className="customer-text-button" onClick={() => setEditing(false)}>Keep original dates</button></div></div>}
    {!editable && <p className="booking-fine-print">Completed and cancelled examples are read-only. Upcoming examples can be changed until their pickup date.</p>}
    <dialog className="customer-cancel-dialog" ref={cancelDialog} aria-labelledby="customer-cancel-title"><p className="booking-kicker">Example action</p><h3 id="customer-cancel-title">Cancel this journey?</h3><p>This changes only the demonstration status in this browser session. There is no real booking to cancel.</p><div className="customer-detail-actions"><button type="button" className="booking-next" onClick={confirmCancel}>Cancel example journey</button><button type="button" className="customer-text-button" onClick={() => cancelDialog.current?.close()}>Keep it</button></div></dialog>
  </section>;
}
