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

  if (!bookings) return <p className="customer-empty" role="status">Loading journey…</p>;
  if (!booking || !car) return <div className="customer-empty"><strong>Journey not found.</strong><Link className="account-entry-return" href="/account/bookings">Back to journeys</Link></div>;

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
    if (!changeJourney(id, pickup, returnDate, location)) { setError('This journey can no longer be changed.'); return; }
    setEditing(false);
    setNotice('Journey details updated.');
  }

  function confirmCancel() {
    if (cancel(id)) setNotice('Journey status updated.');
    cancelDialog.current?.close();
  }

  return <section aria-labelledby="customer-detail-title">
    <Link className="back-link" href="/account/bookings">My bookings / {booking.id}</Link>
    <div className="customer-section-heading customer-detail-heading"><p className="booking-kicker">Journey / {booking.id}</p><h2 id="customer-detail-title">{car.name}.</h2><p>The details of the drive, all in one place.</p></div>
    <div className="customer-detail-photo"><Image src={car.image} alt={car.alt} fill sizes="(max-width: 900px) 100vw, 70vw" style={{ objectPosition: car.position }} /></div>
    <div className="customer-detail-grid">
      <div><p className={`customer-status customer-status--${booking.status}`}>{booking.status.toUpperCase()}</p><h3>The details.</h3></div>
      <dl className="customer-detail-facts"><div><dt>Collection</dt><dd>{locationNames[booking.location]}<br />{formatDate(booking.pickup)}</dd></div><div><dt>Return</dt><dd>{locationNames[booking.location]}<br />{formatDate(booking.returnDate)}</dd></div><div><dt>Duration</dt><dd>{rentalDays(booking.pickup, booking.returnDate)} days</dd></div><div><dt>Extras</dt><dd>{booking.extras.length ? booking.extras.map((extra) => extra === 'additional-driver' ? 'Additional driver' : 'Child seat').join(', ') : 'None'}</dd></div><div><dt>Estimated total</dt><dd>{pounds(quote)}</dd></div></dl>
    </div>
    {notice && <p className="customer-notice" role="status">{notice}</p>}
    {editable && !editing && <div className="customer-detail-actions"><button type="button" className="booking-next" onClick={beginEdit}>Change dates</button><button type="button" className="customer-text-button" onClick={() => cancelDialog.current?.showModal()}>Cancel journey</button></div>}
    {editing && <div className="customer-edit" aria-label="Change journey"><div className="customer-section-heading"><p className="booking-kicker">Change the plan</p><h3>New dates, same car.</h3></div><div className="booking-field"><label htmlFor="customer-location">Pickup and return location</label><select id="customer-location" value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div className="booking-field"><span className="booking-label">Pickup and return dates</span><DateRangePicker pickup={pickup} returnDate={returnDate} blocked={blocked} onChange={(nextPickup, nextReturn) => { setPickup(nextPickup); setReturnDate(nextReturn); setError(''); }} compact /></div>{error && <p className="booking-field-error" role="alert">{error}</p>}<div className="customer-detail-actions"><button type="button" className="booking-next" onClick={saveEdit}>Save changes</button><button type="button" className="customer-text-button" onClick={() => setEditing(false)}>Keep original dates</button></div></div>}
    {!editable && <p className="booking-fine-print">Completed and cancelled journeys are read-only.</p>}
    <dialog className="customer-cancel-dialog" ref={cancelDialog} aria-labelledby="customer-cancel-title"><p className="booking-kicker">Change journey</p><h3 id="customer-cancel-title">Cancel this journey?</h3><p>You can keep the current plan or change its status to cancelled.</p><div className="customer-detail-actions"><button type="button" className="booking-next" onClick={confirmCancel}>Cancel journey</button><button type="button" className="customer-text-button" onClick={() => cancelDialog.current?.close()}>Keep it</button></div></dialog>
  </section>;
}
