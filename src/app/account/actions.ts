'use server';

import { signOut } from '@/auth';

export async function signOutCustomer() {
  await signOut({ redirectTo: '/account/sign-in' });
}
