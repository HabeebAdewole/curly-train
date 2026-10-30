'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';

const storageKey = 'rinjo-cookie-notice-closed';
const changeEvent = 'rinjo-cookie-notice-change';

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  return () => window.removeEventListener(changeEvent, callback);
}

function isVisible() {
  try { return sessionStorage.getItem(storageKey) !== 'yes'; }
  catch { return true; }
}

export function CookieNotice() {
  const visible = useSyncExternalStore(subscribe, isVisible, () => false);

  if (!visible) return null;

  return <aside className="cookie-notice" aria-label="Cookie notice">
    <p>We use essential cookies for optional Google sign-in and browser session storage for journey plans. No analytics or advertising trackers are active. <Link href="/cookies">Read the cookie policy</Link>.</p>
    <button type="button" onClick={() => { try { sessionStorage.setItem(storageKey, 'yes'); } catch {} window.dispatchEvent(new Event(changeEvent)); }}>Close notice</button>
  </aside>;
}
