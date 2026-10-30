'use client';

import { useEffect } from 'react';
import { customerSessionKey } from '@/lib/customer-session-key';

export function CustomerProfile({ name, email }: { name: string; email: string }) {
  useEffect(() => {
    // Remove details saved by the earlier preview; no driver data is needed now.
    sessionStorage.removeItem(customerSessionKey('driver', email));
  }, [email]);

  return <section aria-labelledby="customer-profile-title">
    <div className="customer-section-heading"><p className="booking-kicker">02 / Profile</p><h2 id="customer-profile-title">Your details.</h2><p>Only the basic Google account details used for sign-in are shown here.</p></div>
    <div className="customer-profile-identity"><div><span>Name from Google</span><strong>{name}</strong></div><div><span>Email from Google</span><strong>{email}</strong></div></div>
    <p className="customer-notice">Driver and licence details are not collected while real reservations are unavailable.</p>
  </section>;
}
