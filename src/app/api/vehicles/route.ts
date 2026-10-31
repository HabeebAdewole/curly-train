import { publishedVehicles } from '../../../../backend/repositories/vehicles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const operator = new URL(request.url).searchParams.get('operator');
  if (!operator || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(operator) || operator.length > 80) {
    return Response.json({ error: 'Enter a valid operator.' }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'The vehicle service is not configured.' }, { status: 503 });
  }

  try {
    const vehicles = await publishedVehicles(operator);
    return Response.json({ vehicles }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Vehicle lookup failed:', error);
    return Response.json({ error: 'Vehicles are temporarily unavailable.' }, { status: 503 });
  }
}
