import { locationNames } from '@/lib/locations';

export function bookingWhatsAppUrl(number: string | null, request: {
  reference: string;
  vehicle_name: string;
  pickup: string;
  returnDate: string;
  pickup_location: string;
  requested_extras: string[];
  base_total_kobo: string;
}) {
  if (!number || !/^[1-9][0-9]{6,14}$/.test(number)) return null;
  const extras = request.requested_extras.length ? request.requested_extras.map((item) => item.replaceAll('-', ' ')).join(', ') : 'None';
  const baseNaira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(BigInt(request.base_total_kobo) / BigInt(100)));
  const message = [
    `Hello, I submitted booking request ${request.reference} on Rinjo.`,
    `Vehicle: ${request.vehicle_name}`,
    `Pickup: ${request.pickup} at ${locationNames[request.pickup_location] || request.pickup_location}`,
    `Return: ${request.returnDate}`,
    `Requested extras: ${extras}`,
    `Indicative base total: ${baseNaira} (operator to confirm).`,
    'Please check the request in Rinjo and confirm the next steps.',
  ].join('\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
