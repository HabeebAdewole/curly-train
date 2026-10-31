import { auth } from '@/auth';
import { decideBookingRequest, RequestProblem } from '../../../../../../../backend/services/booking-requests';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) return Response.json({ error: 'Operator requests are not configured.' }, { status: 503 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json') || Number(request.headers.get('content-length') || 0) > 500) return Response.json({ error: 'Invalid request.' }, { status: 400 });
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: 'Staff sign-in is required.' }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'Request not found.' }, { status: 404 });
  let body: { decision?: unknown };
  try { const raw = await request.text(); if (raw.length > 500) throw new Error('Too large'); body = JSON.parse(raw); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (body?.decision !== 'approved' && body?.decision !== 'declined') return Response.json({ error: 'Choose approve or decline.' }, { status: 400 });
  try {
    const result = await decideBookingRequest(id, session.user.email, body.decision);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof RequestProblem) return Response.json({ error: error.message }, { status: error.status });
    console.error('Staff booking decision failed:', error);
    return Response.json({ error: 'The decision could not be saved.' }, { status: 503 });
  }
}
