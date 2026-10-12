'use client';

import { useState } from 'react';
import { DateRangePicker } from '@/components/date-range-picker';
import { dateError, exampleBlockedDates, rangeContainsBlocked, rentalDays, todayInLondon } from '@/lib/dates';

export function VehicleDates({ rate, index, initialPickup = '', initialReturn = '' }: { rate: number; index: number; initialPickup?: string; initialReturn?: string }) {
  const blocked = exampleBlockedDates(index);
  const initialValid = !dateError(initialPickup, initialReturn) && !rangeContainsBlocked(initialPickup, initialReturn, blocked);
  const [pickup, setPickup] = useState(initialValid ? initialPickup : '');
  const [returnDate, setReturnDate] = useState(initialValid ? initialReturn : '');
  const days = rentalDays(pickup, returnDate);
  const valid = days > 0 && !dateError(pickup, returnDate, todayInLondon()) && !rangeContainsBlocked(pickup, returnDate, blocked);
  return <div className="vehicle-dates"><p className="eyebrow">SHAPE THE JOURNEY</p><h2>Make it yours.</h2><p>Choose dates to see an illustrative base-rate estimate.</p><DateRangePicker pickup={pickup} returnDate={returnDate} blocked={blocked} onChange={(start, end) => { setPickup(start); setReturnDate(end); }} compact />{valid ? <div className="vehicle-estimate"><span>{days} {days === 1 ? 'day' : 'days'} × £{rate}</span><strong>£{(days * rate).toLocaleString('en-GB')}</strong></div> : <p className="vehicle-date-hint">Select a pickup and return date to see the estimate.</p>}<p className="vehicle-demo-note">Example unavailable dates and illustrative base rate only. Taxes, fees, extras, and live availability are not included. Booking starts in the next phase.</p></div>;
}
