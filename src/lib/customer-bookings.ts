import { calculateQuote, type ExtraId } from '@/lib/booking';
import { addDays, todayInLondon } from '@/lib/dates';

export type DemoBookingStatus = 'upcoming' | 'completed' | 'cancelled';

export type DemoBooking = {
  id: string;
  carId: string;
  pickup: string;
  returnDate: string;
  location: string;
  extras: ExtraId[];
  status: DemoBookingStatus;
};

// Illustrative customer journeys. They are not created by Stripe Checkout or
// connected to a real vehicle, payment, or inventory system.
export function exampleBookings(today = todayInLondon()): DemoBooking[] {
  return [
    { id: 'MB-1048', carId: 'mercedes-s-class', pickup: addDays(today, 21), returnDate: addDays(today, 25), location: 'heathrow', extras: ['additional-driver'], status: 'upcoming' },
    { id: 'MB-1026', carId: 'lexus-nx', pickup: addDays(today, 37), returnDate: addDays(today, 40), location: 'london-city', extras: ['child-seat'], status: 'upcoming' },
    { id: 'MB-0982', carId: 'porsche-911-turbo-s', pickup: addDays(today, -51), returnDate: addDays(today, -48), location: 'kings-cross', extras: [], status: 'completed' },
  ];
}

export function demoBookingAmount(booking: DemoBooking) {
  return calculateQuote(booking, booking.extras)?.total ?? 0;
}

export function canChangeDemoBooking(booking: DemoBooking, today = todayInLondon()) {
  return booking.status === 'upcoming' && booking.pickup > today;
}
