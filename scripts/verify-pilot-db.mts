import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { databasePool } from '../backend/db/pool';
import { createBookingRequest, decideBookingRequest, getBookingRequest, getPilotVehicles, getStaffRequests, RequestProblem } from '../backend/services/booking-requests';
import { addDays, todayInNigeria } from '../src/lib/dates';
import { bookingWhatsAppUrl } from '../src/lib/pilot-whatsapp';

if (process.env.PILOT_OPERATOR_SLUG !== 'rinjo-local' || !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '')) {
  throw new Error('This verification script may only use the local test operator and local database.');
}

const created: string[] = [];
try {
  const data = await getPilotVehicles();
  assert.equal(data?.operator.slug, 'rinjo-local');
  const vehicle = data?.vehicles.find((item) => item.slug === 'local-test-suv');
  assert.ok(vehicle, 'Seed the local test vehicle first.');
  const pickup = addDays(todayInNigeria(), 40);
  const returnDate = addDays(todayInNigeria(), 43);
  const request = { vehicleId: vehicle.id, pickup, returnDate, location: 'lagos-vi', extras: ['child-seat'], channel: 'rinjo' as const };
  const firstUser = { email: 'pilot-a@example.test', name: 'Pilot Customer A' };
  const secondUser = { email: 'pilot-b@example.test', name: 'Pilot Customer B' };
  const firstKey = randomUUID();
  const first = await createBookingRequest({ ...request, idempotencyKey: firstKey }, firstUser);
  assert.ok(first);
  created.push(first.id);
  const retry = await createBookingRequest({ ...request, idempotencyKey: firstKey }, firstUser);
  assert.equal(retry?.id, first.id, 'A retry must not create a second request.');
  const second = await createBookingRequest({ ...request, idempotencyKey: randomUUID() }, secondUser);
  assert.ok(second);
  created.push(second.id);
  assert.equal(await getBookingRequest(first.id, secondUser.email), null, 'Another customer must not read this request.');
  const staff = await getStaffRequests('manager@example.test');
  assert.ok(staff?.requests.some((item) => item.id === first.id));
  assert.equal(await getStaffRequests('stranger@example.test'), null, 'Unlisted staff must be denied.');
  await decideBookingRequest(first.id, 'manager@example.test', 'approved');
  await assert.rejects(() => decideBookingRequest(second.id, 'manager@example.test', 'approved'), (error) => error instanceof RequestProblem && error.status === 409);
  await assert.rejects(() => createBookingRequest({ ...request, idempotencyKey: randomUUID() }, { email: 'pilot-c@example.test', name: 'Pilot Customer C' }), (error) => error instanceof RequestProblem && error.status === 409);
  const link = bookingWhatsAppUrl('2348012345678', first);
  assert.ok(link?.startsWith('https://wa.me/2348012345678?text='));
  assert.ok(link.includes(encodeURIComponent(first.reference)));
  assert.ok(!decodeURIComponent(link).includes(first.customer_email), 'WhatsApp link must omit customer email.');
  console.log('Local PostgreSQL verification passed: readback, idempotency, customer/staff access, approval conflict, and WhatsApp message content.');
} finally {
  if (created.length) await databasePool().query('DELETE FROM booking_requests WHERE id = ANY($1::uuid[])', [created]);
  await databasePool().end();
}
