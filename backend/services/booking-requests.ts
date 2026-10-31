import 'server-only';

import { randomBytes } from 'node:crypto';
import { databasePool } from '../db/pool';
import { locations } from '../../src/lib/locations';
import { dateError, rentalDays, todayInNigeria } from '../../src/lib/dates';

export type RequestChannel = 'rinjo' | 'whatsapp';
export type RequestStatus = 'pending' | 'approved' | 'declined';
export type RequestInput = {
  vehicleId: string;
  pickup: string;
  returnDate: string;
  location: string;
  extras: string[];
  channel: RequestChannel;
  idempotencyKey: string;
};

type OperatorRow = { id: string; slug: string; name: string; city: string; whatsapp_number: string | null };
type VehicleRow = { id: string; operator_id: string; name: string; slug: string; status: string; daily_rate_kobo: string };
type BookingRow = { id: string; reference: string; operator_id: string; vehicle_id: string; customer_email: string; customer_name: string; pickup: string; returnDate: string; pickup_location: string; requested_extras: string[]; base_total_kobo: string; status: RequestStatus; channel: RequestChannel; vehicle_name: string; operator_name: string; whatsapp_number: string | null; created_at: string };

export class RequestProblem extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function configuredOperator() {
  return process.env.DATABASE_URL && process.env.PILOT_OPERATOR_SLUG?.trim() || null;
}

function validateInput(input: RequestInput) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(input.vehicleId)) throw new RequestProblem(400, 'Choose an operator vehicle.');
  if (!uuid.test(input.idempotencyKey)) throw new RequestProblem(400, 'Refresh the page and try again.');
  if (input.channel !== 'rinjo' && input.channel !== 'whatsapp') throw new RequestProblem(400, 'Choose a request method.');
  if (!Array.isArray(input.extras) || input.extras.length > 2 || input.extras.some((item) => !['additional-driver', 'child-seat'].includes(item))) throw new RequestProblem(400, 'Check the requested extras.');
  const problem = dateError(input.pickup, input.returnDate, todayInNigeria());
  if (problem || rentalDays(input.pickup, input.returnDate) > 28) throw new RequestProblem(400, problem || 'Choose 28 days or fewer.');
  if (!locations.some((item) => item.value === input.location)) throw new RequestProblem(400, 'Choose a valid pickup location.');
}

export async function getPilotOperator() {
  const slug = configuredOperator();
  if (!slug) return null;
  const result = await databasePool().query<OperatorRow>('SELECT id, slug, name, city, whatsapp_number FROM operators WHERE slug = $1', [slug]);
  return result.rows[0] || null;
}

export async function getPilotVehicles() {
  const operator = await getPilotOperator();
  if (!operator) return null;
  const result = await databasePool().query<VehicleRow & { category: string; seats: number; transmission: string; photo_url: string | null }>(
    `SELECT id, operator_id, name, slug, status, daily_rate_kobo, category, seats, transmission, photo_url
       FROM vehicles WHERE operator_id = $1 AND status = 'active' ORDER BY name`, [operator.id]);
  return { operator: { slug: operator.slug, name: operator.name, city: operator.city, hasWhatsApp: Boolean(operator.whatsapp_number) }, vehicles: result.rows.map((row) => ({ id: row.id, slug: row.slug, name: row.name, category: row.category, seats: row.seats, transmission: row.transmission, photoUrl: row.photo_url, dailyRateKobo: row.daily_rate_kobo })) };
}

export async function createBookingRequest(input: RequestInput, user: { email: string; name: string }) {
  validateInput(input);
  const operator = await getPilotOperator();
  if (!operator) throw new RequestProblem(503, 'Operator requests are not available yet.');
  if (input.channel === 'whatsapp' && !operator.whatsapp_number) throw new RequestProblem(400, 'WhatsApp is not available for this operator yet.');
  const location = locations.find((item) => item.value === input.location)!;
  if (location.city !== operator.city) throw new RequestProblem(400, 'Choose a pickup location in the operator city.');
  const email = user.email.trim().toLowerCase();
  const name = user.name.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || name.length < 2 || name.length > 120) throw new RequestProblem(400, 'Your signed-in account needs a name and email.');

  const client = await databasePool().connect();
  try {
    await client.query('BEGIN');
    const vehicleResult = await client.query<VehicleRow>('SELECT id, operator_id, name, slug, status, daily_rate_kobo FROM vehicles WHERE id = $1 AND operator_id = $2 FOR UPDATE', [input.vehicleId, operator.id]);
    const vehicle = vehicleResult.rows[0];
    if (!vehicle || vehicle.status !== 'active') throw new RequestProblem(404, 'This vehicle is not accepting requests.');
    const existing = await client.query<BookingRow>('SELECT id FROM booking_requests WHERE operator_id = $1 AND customer_email = $2 AND idempotency_key = $3', [operator.id, email, input.idempotencyKey]);
    if (existing.rows[0]) {
      await client.query('COMMIT');
      return getBookingRequest(existing.rows[0].id, email);
    }
    const overlap = await client.query('SELECT 1 FROM booking_requests WHERE vehicle_id = $1 AND status = $2 AND pickup_date < $4::date AND return_date > $3::date LIMIT 1', [vehicle.id, 'approved', input.pickup, input.returnDate]);
    if (overlap.rowCount) throw new RequestProblem(409, 'This vehicle is already booked for those dates.');
    const pendingCount = await client.query<{ count: string }>('SELECT count(*)::text AS count FROM booking_requests WHERE operator_id = $1 AND customer_email = $2 AND status = $3', [operator.id, email, 'pending']);
    if (Number(pendingCount.rows[0].count) >= 5) throw new RequestProblem(429, 'You have five open requests already. Please wait for an operator response.');
    const days = rentalDays(input.pickup, input.returnDate);
    const total = BigInt(vehicle.daily_rate_kobo) * BigInt(days);
    const reference = `RJO-${randomBytes(6).toString('hex').toUpperCase()}`;
    const created = await client.query<{ id: string }>(
      `INSERT INTO booking_requests (reference, operator_id, vehicle_id, customer_email, customer_name, idempotency_key, pickup_date, return_date, pickup_location, requested_extras, base_total_kobo, channel)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [reference, operator.id, vehicle.id, email, name, input.idempotencyKey, input.pickup, input.returnDate, input.location, [...new Set(input.extras)], total.toString(), input.channel]);
    await client.query('COMMIT');
    return getBookingRequest(created.rows[0].id, email);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function getBookingRequest(id: string, email: string) {
  const result = await databasePool().query<BookingRow>(
    `SELECT b.id, b.reference, b.operator_id, b.vehicle_id, b.customer_email, b.customer_name,
            b.pickup_date::text AS pickup, b.return_date::text AS "returnDate", b.pickup_location,
            b.requested_extras, b.base_total_kobo, b.status, b.channel, b.created_at::text,
            v.name AS vehicle_name, o.name AS operator_name, o.whatsapp_number
       FROM booking_requests b JOIN vehicles v ON v.id = b.vehicle_id JOIN operators o ON o.id = b.operator_id
      WHERE b.id = $1 AND b.customer_email = $2 AND o.slug = $3`, [id, email.toLowerCase(), configuredOperator()]);
  return result.rows[0] || null;
}

export async function getCustomerRequests(email: string) {
  const operator = await getPilotOperator();
  if (!operator) return [];
  const result = await databasePool().query<Pick<BookingRow, 'id' | 'reference' | 'pickup' | 'returnDate' | 'pickup_location' | 'status' | 'vehicle_name' | 'created_at'>>(
    `SELECT b.id, b.reference, b.pickup_date::text AS pickup, b.return_date::text AS "returnDate",
            b.pickup_location, b.status, b.created_at::text, v.name AS vehicle_name
       FROM booking_requests b JOIN vehicles v ON v.id = b.vehicle_id
      WHERE b.operator_id = $1 AND b.customer_email = $2
      ORDER BY b.created_at DESC LIMIT 100`, [operator.id, email.trim().toLowerCase()]);
  return result.rows;
}

export async function getStaffRequests(email: string) {
  const operator = await getPilotOperator();
  if (!operator) return null;
  const staff = await databasePool().query('SELECT 1 FROM operator_staff WHERE operator_id = $1 AND email = $2', [operator.id, email.toLowerCase()]);
  if (!staff.rowCount) return null;
  const result = await databasePool().query<BookingRow>(
    `SELECT b.id, b.reference, b.operator_id, b.vehicle_id, b.customer_email, b.customer_name,
            b.pickup_date::text AS pickup, b.return_date::text AS "returnDate", b.pickup_location,
            b.requested_extras, b.base_total_kobo, b.status, b.channel, b.created_at::text,
            v.name AS vehicle_name, o.name AS operator_name, o.whatsapp_number
       FROM booking_requests b JOIN vehicles v ON v.id = b.vehicle_id JOIN operators o ON o.id = b.operator_id
      WHERE b.operator_id = $1 ORDER BY b.created_at DESC LIMIT 100`, [operator.id]);
  return { operator, requests: result.rows };
}

export async function decideBookingRequest(id: string, email: string, decision: 'approved' | 'declined') {
  const operator = await getPilotOperator();
  if (!operator) throw new RequestProblem(503, 'Operator requests are not available yet.');
  const staff = await databasePool().query('SELECT 1 FROM operator_staff WHERE operator_id = $1 AND email = $2', [operator.id, email.toLowerCase()]);
  if (!staff.rowCount) throw new RequestProblem(403, 'Staff access is required.');
  const client = await databasePool().connect();
  try {
    await client.query('BEGIN');
    const found = await client.query<{ vehicle_id: string; status: RequestStatus; pickup: string; returnDate: string }>(
      `SELECT vehicle_id, status, pickup_date::text AS pickup, return_date::text AS "returnDate" FROM booking_requests WHERE id = $1 AND operator_id = $2`, [id, operator.id]);
    const booking = found.rows[0];
    if (!booking) throw new RequestProblem(404, 'Request not found.');
    await client.query('SELECT id FROM vehicles WHERE id = $1 AND operator_id = $2 FOR UPDATE', [booking.vehicle_id, operator.id]);
    const current = await client.query<{ status: RequestStatus }>('SELECT status FROM booking_requests WHERE id = $1 FOR UPDATE', [id]);
    if (current.rows[0].status !== 'pending') throw new RequestProblem(409, 'This request has already been decided.');
    if (decision === 'approved') {
      const overlap = await client.query('SELECT 1 FROM booking_requests WHERE vehicle_id = $1 AND id <> $2 AND status = $3 AND pickup_date < $5::date AND return_date > $4::date LIMIT 1', [booking.vehicle_id, id, 'approved', booking.pickup, booking.returnDate]);
      if (overlap.rowCount) throw new RequestProblem(409, 'Another approved request overlaps these dates.');
    }
    await client.query('UPDATE booking_requests SET status = $1, decided_at = now(), decided_by = $2 WHERE id = $3', [decision, email.toLowerCase(), id]);
    await client.query('COMMIT');
    return { id, status: decision };
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
