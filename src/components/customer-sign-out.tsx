'use client';

import { signOutCustomer } from '@/app/account/actions';
import { customerSessionKey } from '@/lib/customer-session-key';

export function CustomerSignOut({ email }: { email: string }) {
  return <form action={signOutCustomer} onSubmit={() => {
    sessionStorage.removeItem(customerSessionKey('driver', email));
    sessionStorage.removeItem(customerSessionKey('bookings', email));
  }}><button type="submit">Sign out</button></form>;
}
