import { dateError, exampleBlockedDates, rangeContainsBlocked, rentalDays, todayInNigeria } from '@/lib/dates';
import { carById, fleet } from '@/lib/fleet';
import { locations } from '@/lib/locations';

export const extrasCatalog = [
  { id: 'additional-driver', name: 'Additional driver', description: 'Share the driving on a longer journey.', dailyRate: 15000 },
  { id: 'child-seat', name: 'Child seat', description: 'Add a child seat for the journey.', dailyRate: 7500 },
] as const;

export type ExtraId = (typeof extrasCatalog)[number]['id'];
export type Journey = { carId: string; pickup: string; returnDate: string; location: string };
export type Driver = { fullName: string; email: string; phone: string; licenceCountry: string };
export type BookingSelection = Journey & { extras: ExtraId[]; driver: Driver };
export type FieldErrors = Partial<Record<keyof Journey | keyof Driver | 'agreement', string>>;

export function validExtraIds(values: unknown): ExtraId[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values)].filter((value): value is ExtraId => typeof value === 'string' && extrasCatalog.some((extra) => extra.id === value));
}

export function validateJourney(value: Journey, today = todayInNigeria()): FieldErrors {
  const errors: FieldErrors = {};
  const car = carById(value.carId);
  if (!car) errors.carId = 'Choose a car from the collection.';
  if (!locations.some((location) => location.value === value.location)) errors.location = 'Choose a pickup location.';
  const datesProblem = dateError(value.pickup, value.returnDate, today);
  if (datesProblem) errors.pickup = datesProblem;
  else if (rentalDays(value.pickup, value.returnDate) > 28) errors.returnDate = 'Choose 28 days or fewer.';
  else if (car && rangeContainsBlocked(value.pickup, value.returnDate, exampleBlockedDates(fleet.indexOf(car), today))) errors.returnDate = 'This range includes an unavailable date.';
  return errors;
}

export function validateDriver(value: Driver): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = value.fullName.trim();
  if (fullName.length < 2 || fullName.length > 80 || !fullName.includes(' ')) errors.fullName = 'Enter your first and last name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim()) || value.email.length > 254) errors.email = 'Enter a valid email address.';
  if (!/^\+?[\d\s()\-]{7,24}$/.test(value.phone.trim()) || value.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a valid phone number.';
  if (value.licenceCountry.trim().length < 2 || value.licenceCountry.trim().length > 60) errors.licenceCountry = 'Enter the country that issued your licence.';
  return errors;
}

export function calculateQuote(journey: Journey, selectedExtras: ExtraId[]) {
  const car = carById(journey.carId);
  const days = rentalDays(journey.pickup, journey.returnDate);
  if (!car || days <= 0 || days > 28) return null;
  const extras = extrasCatalog.filter((extra) => selectedExtras.includes(extra.id)).map((extra) => ({ ...extra, amount: extra.dailyRate * days }));
  const carAmount = car.dailyRate * days;
  return { car, days, carAmount, extras, total: carAmount + extras.reduce((sum, extra) => sum + extra.amount, 0) };
}

export function naira(amount: number) { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount); }
