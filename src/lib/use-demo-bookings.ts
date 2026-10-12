'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { validateJourney } from '@/lib/booking';
import { canChangeDemoBooking, exampleBookings, type DemoBooking } from '@/lib/customer-bookings';
import { customerSessionKey } from '@/lib/customer-session-key';

const eventName = 'morrow-example-bookings-change';

function loadBookings(raw: string | null): DemoBooking[] {
  const examples = exampleBookings();
  try {
    const saved = JSON.parse(raw || 'null');
    if (!Array.isArray(saved)) return examples;
    return examples.map((example) => {
      const match = saved.find((item) => item && item.id === example.id);
      if (!match) return example;
      const journey = { carId: example.carId, pickup: match.pickup, returnDate: match.returnDate, location: match.location };
      const updated = example.status === 'upcoming' && !Object.keys(validateJourney(journey)).length ? { ...example, ...journey } : example;
      return match.status === 'cancelled' && example.status === 'upcoming' ? { ...updated, status: 'cancelled' as const } : updated;
    });
  } catch { return examples; }
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}

export function useDemoBookings(email: string) {
  const key = customerSessionKey('bookings', email);
  const raw = useSyncExternalStore(subscribe, () => sessionStorage.getItem(key), () => null);
  const bookings = useMemo(() => loadBookings(raw), [raw]);

  function save(next: DemoBooking[]) {
    sessionStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(eventName));
  }

  function cancel(id: string) {
    const target = bookings.find((booking) => booking.id === id);
    if (!target || !canChangeDemoBooking(target)) return false;
    save(bookings.map((booking) => booking.id === id ? { ...booking, status: 'cancelled' } : booking));
    return true;
  }

  function changeJourney(id: string, pickup: string, returnDate: string, location: string) {
    const target = bookings.find((booking) => booking.id === id);
    if (!target || !canChangeDemoBooking(target)) return false;
    const journey = { carId: target.carId, pickup, returnDate, location };
    if (Object.keys(validateJourney(journey)).length) return false;
    save(bookings.map((booking) => booking.id === id ? { ...booking, ...journey } : booking));
    return true;
  }

  return { bookings, cancel, changeJourney };
}
