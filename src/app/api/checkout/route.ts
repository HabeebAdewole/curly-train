import { randomUUID } from 'node:crypto';
import { calculateQuote, validExtraIds, validateDriver, validateJourney, type Driver, type Journey } from '@/lib/booking';
import { appBaseUrl, createTestPayment, flutterwaveTestKey } from '@/lib/flutterwave-server';
import { paymentMode } from '@/lib/payment-mode';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'This checkout request was not sent from Rinjo.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json') || Number(request.headers.get('content-length') || 0) > 10_000) return Response.json({ error: 'Invalid checkout request.' }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid checkout request.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return Response.json({ error: 'Invalid checkout request.' }, { status: 400 });

  const journey: Journey = {
    carId: typeof body.carId === 'string' ? body.carId : '',
    pickup: typeof body.pickup === 'string' ? body.pickup : '',
    returnDate: typeof body.returnDate === 'string' ? body.returnDate : '',
    location: typeof body.location === 'string' ? body.location : '',
  };
  const rawDriver = body.driver && typeof body.driver === 'object' && !Array.isArray(body.driver) ? body.driver as Record<string, unknown> : {};
  const driver: Driver = {
    fullName: typeof rawDriver.fullName === 'string' ? rawDriver.fullName : '',
    email: typeof rawDriver.email === 'string' ? rawDriver.email : '',
    phone: typeof rawDriver.phone === 'string' ? rawDriver.phone : '',
    licenceCountry: typeof rawDriver.licenceCountry === 'string' ? rawDriver.licenceCountry : '',
  };
  const extras = validExtraIds(body.extras);
  if (!Array.isArray(body.extras) || body.extras.length !== extras.length || Object.keys(validateJourney(journey)).length) return Response.json({ error: 'Check the journey details, then try again.' }, { status: 400 });

  const quote = calculateQuote(journey, extras);
  if (!quote) return Response.json({ error: 'The selected journey could not be priced.' }, { status: 400 });
  if (paymentMode() === 'simulation') return Response.json({ mode: 'simulation', reference: `plan-${randomUUID().replaceAll('-', '')}`, journey, extras }, { headers: { 'Cache-Control': 'no-store' } });
  if (Object.keys(validateDriver(driver)).length) return Response.json({ error: 'Payment setup is not available for this journey.' }, { status: 503 });
  const key = flutterwaveTestKey();
  const baseUrl = appBaseUrl();
  if (!key || !baseUrl) return Response.json({ error: 'Flutterwave test checkout is not configured yet. Add the test secret key and app URL to .env.local.' }, { status: 503 });

  try {
    const url = await createTestPayment(key, {
      reference: `rinjo-${randomUUID().replaceAll('-', '')}`,
      amount: quote.total,
      email: driver.email.trim(),
      journey,
      extras,
      redirectUrl: `${baseUrl}/booking/confirmation`,
    });
    if (!url) return Response.json({ error: 'Flutterwave did not return a NGN test checkout. Check the test account’s currency access and try again.' }, { status: 502 });
    return Response.json({ mode: 'flutterwave', url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Flutterwave test checkout is unavailable right now. Check the test key and try again.' }, { status: 502 });
  }
}
