'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { customerSessionKey } from '@/lib/customer-session-key';

const eventName = 'morrow-example-driver-change';

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}

function storedDetails(raw: string | null) {
  try {
    const value = JSON.parse(raw || '{}');
    return { phone: typeof value.phone === 'string' ? value.phone : '', licenceCountry: typeof value.licenceCountry === 'string' ? value.licenceCountry : '' };
  } catch { return { phone: '', licenceCountry: '' }; }
}

export function CustomerProfile({ name, email }: { name: string; email: string }) {
  const key = customerSessionKey('driver', email);
  const raw = useSyncExternalStore(subscribe, () => sessionStorage.getItem(key), () => null);
  const stored = useMemo(() => storedDetails(raw), [raw]);
  const [draft, setDraft] = useState<{ phone: string; licenceCountry: string } | null>(null);
  const phone = draft?.phone ?? stored.phone;
  const licenceCountry = draft?.licenceCountry ?? stored.licenceCountry;
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    if (!/^\+?[\d\s()\-]{7,24}$/.test(phone.trim()) || phone.replace(/\D/g, '').length < 7) { setError('Enter a valid example phone number.'); return; }
    if (licenceCountry.trim().length < 2 || licenceCountry.trim().length > 60) { setError('Enter the country that issued the example licence.'); return; }
    sessionStorage.setItem(key, JSON.stringify({ phone: phone.trim(), licenceCountry: licenceCountry.trim() }));
    window.dispatchEvent(new Event(eventName));
    setDraft(null);
    setError('');
    setSaved(true);
  }

  return <section aria-labelledby="customer-profile-title">
    <div className="customer-section-heading"><p className="booking-kicker">02 / Profile</p><h2 id="customer-profile-title">Your details.</h2><p>Your name and email come from Google. The driver details below are a browser-session demonstration and are not submitted for a real rental.</p></div>
    <div className="customer-profile-identity"><div><span>Name from Google</span><strong>{name}</strong></div><div><span>Email from Google</span><strong>{email}</strong></div></div>
    <form className="customer-profile-form" onSubmit={save} noValidate>
      <h3>Driver details.</h3><p>Use example information. We do not ask for a licence number or identity document.</p>
      <div className="booking-field"><label htmlFor="customer-phone">Phone number</label><input id="customer-phone" type="tel" autoComplete="off" value={phone} onChange={(event) => { setDraft({ phone: event.target.value, licenceCountry }); setError(''); setSaved(false); }} placeholder="+44 7700 900000" /></div>
      <div className="booking-field"><label htmlFor="customer-licence-country">Licence issuing country</label><input id="customer-licence-country" autoComplete="off" value={licenceCountry} onChange={(event) => { setDraft({ phone, licenceCountry: event.target.value }); setError(''); setSaved(false); }} placeholder="e.g. United Kingdom" /></div>
      {error && <p className="booking-field-error" role="alert">{error}</p>}
      {saved && <p className="customer-notice" role="status">Example driver details saved for this browser session.</p>}
      <button type="submit" className="booking-next">Save example details</button>
    </form>
  </section>;
}
