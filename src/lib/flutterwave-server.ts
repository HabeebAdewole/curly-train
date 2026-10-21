import { calculateQuote, validExtraIds, type Journey } from '@/lib/booking';
import { locationNames } from '@/lib/locations';

const apiBase = 'https://api.flutterwave.com/v3';

export function flutterwaveTestKey() {
  const key = process.env.FLW_SECRET_KEY?.trim();
  return key?.startsWith('FLWSECK_TEST-') && !key.includes('replace_me') ? key : null;
}

export function appBaseUrl() {
  const value = process.env.APP_BASE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) return null;
    return url.origin;
  } catch { return null; }
}

export async function createTestPayment(key: string, details: {
  reference: string;
  amount: number;
  email: string;
  journey: Journey;
  extras: string[];
  redirectUrl: string;
}) {
  const response = await fetch(`${apiBase}/payments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      tx_ref: details.reference,
      amount: details.amount,
      currency: 'NGN',
      redirect_url: details.redirectUrl,
      customer: { email: details.email },
      customizations: { title: 'Rinjo portfolio test checkout', description: 'Demonstration journey — no real vehicle reservation' },
      meta: { ...details.journey, extras: details.extras.join(',') },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return null;
  const result: unknown = await response.json();
  if (!isRecord(result) || result.status !== 'success' || !isRecord(result.data) || typeof result.data.link !== 'string') return null;
  try {
    const url = new URL(result.data.link);
    return url.protocol === 'https:' && url.hostname === 'checkout.flutterwave.com' ? url.toString() : null;
  } catch { return null; }
}

export async function verifyTestPayment(key: string, transactionId: string) {
  const response = await fetch(`${apiBase}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return null;
  const result: unknown = await response.json();
  return isRecord(result) && result.status === 'success' && isRecord(result.data) ? result.data : null;
}

export function confirmedTestJourney(transaction: Record<string, unknown>, reference: string) {
  if (transaction.tx_ref !== reference || transaction.status !== 'successful' || transaction.currency !== 'NGN') return null;
  let meta: unknown = transaction.meta;
  if (typeof meta === 'string') {
    try { meta = JSON.parse(meta); } catch { return null; }
  }
  if (!isRecord(meta)) return null;
  const journey: Journey = {
    carId: typeof meta.carId === 'string' ? meta.carId : '',
    pickup: typeof meta.pickup === 'string' ? meta.pickup : '',
    returnDate: typeof meta.returnDate === 'string' ? meta.returnDate : '',
    location: typeof meta.location === 'string' ? meta.location : '',
  };
  const rawExtras = typeof meta.extras === 'string' && meta.extras ? meta.extras.split(',') : [];
  const extras = validExtraIds(rawExtras);
  const quote = calculateQuote(journey, extras);
  if (extras.length !== rawExtras.length || !quote || !locationNames[journey.location] || Number(transaction.amount) !== quote.total) return null;
  return { journey, quote };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
