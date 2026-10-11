import { calculateQuote, validExtraIds, validateDriver, validateJourney, type Driver, type Journey } from '@/lib/booking';
import { locationNames } from '@/lib/locations';
import { appBaseUrl, testStripe } from '@/lib/stripe-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const baseUrl = appBaseUrl();
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'This checkout request was not sent from Morrow.' }, { status: 403 });
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
  if (!Array.isArray(body.extras) || body.extras.length !== extras.length || Object.keys(validateJourney(journey)).length || Object.keys(validateDriver(driver)).length) return Response.json({ error: 'Check the journey and driver details, then try again.' }, { status: 400 });

  const quote = calculateQuote(journey, extras);
  if (!quote) return Response.json({ error: 'The selected journey could not be priced.' }, { status: 400 });
  const stripe = testStripe();
  if (!stripe || !baseUrl) return Response.json({ error: 'Stripe test checkout is not configured yet. Add your test key and app URL to .env.local.' }, { status: 503 });
  const cancelQuery = new URLSearchParams({ pickup: journey.pickup, return: journey.returnDate, location: journey.location, canceled: '1' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: driver.email.trim(),
      line_items: [
        { price_data: { currency: 'gbp', unit_amount: quote.car.dailyRate * 100, product_data: { name: `Morrow demo — ${quote.car.name}`, description: `${locationNames[journey.location]} · ${journey.pickup} to ${journey.returnDate}` } }, quantity: quote.days },
        ...quote.extras.map((extra) => ({ price_data: { currency: 'gbp', unit_amount: extra.dailyRate * 100, product_data: { name: `${extra.name} (demo)` } }, quantity: quote.days })),
      ],
      metadata: { carId: journey.carId, pickup: journey.pickup, returnDate: journey.returnDate, location: journey.location, extras: extras.join(',') },
      success_url: `${baseUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/${journey.carId}?${cancelQuery}`,
    });
    if (!session.url) return Response.json({ error: 'Stripe did not return a checkout page.' }, { status: 502 });
    return Response.json({ url: session.url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Stripe test checkout is unavailable right now. Check the test key and try again.' }, { status: 502 });
  }
}
