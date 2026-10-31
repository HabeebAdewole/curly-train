import { auth } from '@/auth';
import { getStaffRequests } from '../../../../../../backend/services/booking-requests';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) return Response.json({ error: 'Operator requests are not configured.' }, { status: 503 });
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: 'Staff sign-in is required.' }, { status: 401 });
  try {
    const data = await getStaffRequests(session.user.email);
    if (!data) return Response.json({ error: 'Staff access is required.' }, { status: 403 });
    return Response.json({ operator: data.operator.name, requests: data.requests.map((item) => ({ id: item.id, reference: item.reference, status: item.status, customerName: item.customer_name, customerEmail: item.customer_email, vehicle: item.vehicle_name, pickup: item.pickup, returnDate: item.returnDate, location: item.pickup_location, extras: item.requested_extras, baseTotalKobo: item.base_total_kobo, channel: item.channel })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Staff request lookup failed:', error);
    return Response.json({ error: 'Requests are temporarily unavailable.' }, { status: 503 });
  }
}
