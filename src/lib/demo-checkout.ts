import { calculateQuote, validExtraIds, type ExtraId, type Journey } from '@/lib/booking';

export const demoCheckoutKey = 'rinjo-journey-checkout';
export const savedPlansKey = 'rinjo-saved-journey-plans';
const savedPlansEvent = 'rinjo-saved-plans-change';

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
    if (typeof record.reference !== 'string' || !/^plan-[a-f0-9]{32}$/.test(record.reference)) return null;
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

export function parseSavedPlans(raw: string | null): DemoCheckout[] {
  try {
    const value: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(value)) return [];
    return value.slice(0, 20).map((item) => parseDemoCheckout(JSON.stringify(item))).filter((item): item is DemoCheckout => Boolean(item && item.status === 'completed'));
  } catch { return []; }
}

export function saveCompletedPlan(plan: DemoCheckout) {
  const existing = parseSavedPlans(sessionStorage.getItem(savedPlansKey));
  sessionStorage.setItem(savedPlansKey, JSON.stringify([plan, ...existing.filter((item) => item.reference !== plan.reference)].slice(0, 20)));
  window.dispatchEvent(new Event(savedPlansEvent));
}

export function savedPlansSnapshot() {
  const saved = sessionStorage.getItem(savedPlansKey);
  if (saved) return saved;
  const latest = parseDemoCheckout(sessionStorage.getItem(demoCheckoutKey));
  return latest?.status === 'completed' ? JSON.stringify([latest]) : null;
}
export function subscribeSavedPlans(callback: () => void) {
  window.addEventListener(savedPlansEvent, callback);
  return () => window.removeEventListener(savedPlansEvent, callback);
}
