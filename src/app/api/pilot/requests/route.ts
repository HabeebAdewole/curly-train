import { auth } from '@/auth';
import { createBookingRequest, RequestProblem, type RequestInput } from '../../../../../backend/services/booking-requests';
import { bookingWhatsAppUrl } from '@/lib/pilot-whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) return Response.json({ error: 'Operator requests are not configured.' }, { status: 503 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json') || Number(request.headers.get('content-length') || 0) > 5000) return Response.json({ error: 'Invalid request.' }, { status: 400 });
  const session = await auth();
  if (!session?.user?.email || !session.user.name) return Response.json({ error: 'Sign in with Google to submit a request.' }, { status: 401 });
  let body: RequestInput;
  try { const raw = await request.text(); if (raw.length > 5000) throw new Error('Too large'); body = JSON.parse(raw); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return Response.json({ error: 'Invalid request.' }, { status: 400 });
  try {
    const saved = await createBookingRequest(body, { email: session.user.email, name: session.user.name });
    if (!saved) throw new Error('Saved request could not be loaded.');
    return Response.json({ id: saved.id, reference: saved.reference, status: saved.status, whatsappUrl: body.channel === 'whatsapp' ? bookingWhatsAppUrl(saved.whatsapp_number, saved) : null }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof RequestProblem) return Response.json({ error: error.message }, { status: error.status });
    console.error('Booking request creation failed:', error);
    return Response.json({ error: 'The request could not be saved. Please try again.' }, { status: 503 });
  }
}
