import { getPilotVehicles } from '../../../../../backend/services/booking-requests';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL || !process.env.PILOT_OPERATOR_SLUG) return Response.json({ error: 'No operator pilot is configured.' }, { status: 503 });
  try {
    const data = await getPilotVehicles();
    if (!data) return Response.json({ error: 'Operator not found.' }, { status: 404 });
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Pilot vehicle lookup failed:', error);
    return Response.json({ error: 'Vehicles are temporarily unavailable.' }, { status: 503 });
  }
}
