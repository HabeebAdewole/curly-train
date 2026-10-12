import { calculateQuote, validExtraIds, type ExtraId, type Journey } from '@/lib/booking';

export const demoCheckoutKey = 'morrow-demo-checkout';

export type DemoCheckout = {
  reference: string;
  journey: Journey;
  extras: ExtraId[];
  status: 'pending' | 'completed';
};

export function parseDemoCheckout(raw: string | null): DemoCheckout | null {
  try {
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    if (typeof record.reference !== 'string' || !/^demo-[a-f0-9]{32}$/.test(record.reference)) return null;
    if (record.status !== 'pending' && record.status !== 'completed') return null;
    if (!record.journey || typeof record.journey !== 'object' || Array.isArray(record.journey)) return null;
    const selected = record.journey as Record<string, unknown>;
    const journey: Journey = {
      carId: typeof selected.carId === 'string' ? selected.carId : '',
      pickup: typeof selected.pickup === 'string' ? selected.pickup : '',
      returnDate: typeof selected.returnDate === 'string' ? selected.returnDate : '',
      location: typeof selected.location === 'string' ? selected.location : '',
    };
    const extras = validExtraIds(record.extras);
    if (!Array.isArray(record.extras) || record.extras.length !== extras.length || !calculateQuote(journey, extras)) return null;
    return { reference: record.reference, journey, extras, status: record.status };
  } catch { return null; }
}

export function demoCheckoutSnapshot() { return sessionStorage.getItem(demoCheckoutKey); }
export function subscribeDemoCheckout() { return () => {}; }
