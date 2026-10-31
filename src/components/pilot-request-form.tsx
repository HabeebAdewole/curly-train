'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateRangePicker } from '@/components/date-range-picker';
import { dateError, rentalDays } from '@/lib/dates';
import { locations, locationNames } from '@/lib/locations';

type Vehicle = { id: string; name: string; dailyRateKobo: string };
type Operator = { name: string; city: string; hasWhatsApp: boolean };

export function PilotRequestForm({ vehicle, operator }: { vehicle: Vehicle; operator: Operator }) {
  const router = useRouter();
  const requestKey = useRef<string | null>(null);
  const [pickup, setPickup] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [location, setLocation] = useState('');
  const [extras, setExtras] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const days = rentalDays(pickup, returnDate);
  const estimate = days > 0 ? Number(BigInt(vehicle.dailyRateKobo) * BigInt(days) / BigInt(100)) : null;

  async function submit(channel: 'rinjo' | 'whatsapp') {
    const problem = dateError(pickup, returnDate);
    if (!location || problem || days > 28 || !agreed) {
      setError(problem || (!location ? 'Choose a pickup location.' : days > 28 ? 'Choose 28 days or fewer.' : 'Confirm the request and privacy notice first.'));
      return;
    }
    if (!requestKey.current) requestKey.current = crypto.randomUUID();
    setPending(true); setError('');
    try {
      const response = await fetch('/api/pilot/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId: vehicle.id, pickup, returnDate, location, extras, channel, idempotencyKey: requestKey.current }) });
      const data: { id?: string; error?: string } = await response.json();
      if (!response.ok || !data.id) throw new Error(data.error || 'The request could not be saved.');
      router.push(`/pilot/requests/${data.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The request could not be saved.'); setPending(false); }
  }

  return <div className="pilot-form-layout"><section aria-label="Request details" className="pilot-form">
    <h2>Where and when?</h2><p>Choose your dates. This sends an enquiry for staff to review; availability and the final rate are confirmed by the operator.</p>
    <div className="booking-field"><label htmlFor="pilot-location">Pickup and return location</label><select id="pilot-location" value={location} onChange={(event) => { setLocation(event.target.value); setError(''); }}><option value="">Choose a location</option>{locations.filter((item) => item.city === operator.city).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
    <div className="booking-field"><span className="booking-label">Pickup and return dates</span><DateRangePicker pickup={pickup} returnDate={returnDate} blocked={[]} onChange={(start, end) => { setPickup(start); setReturnDate(end); setError(''); }} compact /></div>
    <fieldset className="pilot-extras"><legend>Requested extras</legend><p>The operator will confirm whether these are available and what they cost.</p>{[['additional-driver', 'Additional driver'], ['child-seat', 'Child seat']].map(([id, label]) => <label key={id}><input type="checkbox" checked={extras.includes(id)} onChange={(event) => setExtras((current) => event.target.checked ? [...current, id] : current.filter((item) => item !== id))} />{label}</label>)}</fieldset>
    <label className="booking-agreement"><input type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); setError(''); }} /><span>I understand this is a request, not a confirmed rental or payment. My name, email and journey details will be shared with {operator.name} to handle it. I have read the <Link href="/privacy">privacy notice</Link> and <Link href="/terms">site terms</Link>.</span></label>
    {error && <p className="booking-field-error" role="alert">{error}</p>}
    <div className="pilot-actions"><button type="button" className="booking-next" disabled={pending} onClick={() => submit('rinjo')}>{pending ? 'Saving request…' : 'Send request on Rinjo'}</button>{operator.hasWhatsApp && <button type="button" className="booking-back" disabled={pending} onClick={() => submit('whatsapp')}>Continue via WhatsApp</button>}</div>
    {operator.hasWhatsApp && <p className="booking-fine-print">The WhatsApp choice saves the same request on Rinjo, then opens a prepared message. Review it and tap Send in WhatsApp. The message contains the reference and journey details, without your email.</p>}
  </section><aside className="pilot-summary" aria-label="Journey summary"><p className="booking-kicker">Your selection</p><h2>{vehicle.name}</h2><dl><div><dt>Pickup</dt><dd>{location ? locationNames[location] : 'Choose a location'}</dd></div><div><dt>Duration</dt><dd>{days > 0 ? `${days} days` : 'Choose dates'}</dd></div><div><dt>Indicative base total</dt><dd>{estimate === null ? '—' : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(estimate)}</dd></div></dl><p>Extras and any other charges are subject to operator confirmation.</p></aside></div>;
}
