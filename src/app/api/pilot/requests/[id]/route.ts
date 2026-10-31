import { auth } from '@/auth';
import { getBookingRequest } from '../../../../../../backend/services/booking-requests';
import { bookingWhatsAppUrl } from '@/lib/pilot-whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) return Response.json({ error: 'Operator requests are not configured.' }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: 'Sign in to view this request.' }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'Request not found.' }, { status: 404 });
  try {
    const saved = await getBookingRequest(id, session.user.email);
    if (!saved) return Response.json({ error: 'Request not found.' }, { status: 404 });
    return Response.json({ id: saved.id, reference: saved.reference, status: saved.status, vehicle: saved.vehicle_name, operator: saved.operator_name, pickup: saved.pickup, returnDate: saved.returnDate, location: saved.pickup_location, extras: saved.requested_extras, baseTotalKobo: saved.base_total_kobo, channel: saved.channel, whatsappUrl: saved.channel === 'whatsapp' ? bookingWhatsAppUrl(saved.whatsapp_number, saved) : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Booking request lookup failed:', error);
    return Response.json({ error: 'Request is temporarily unavailable.' }, { status: 503 });
  }
}
