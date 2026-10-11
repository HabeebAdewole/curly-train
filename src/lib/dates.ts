const dayMs = 86_400_000;

export function todayInLondon() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

export function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
export function addDays(value: string, count: number) { const date = parseISODate(value); return date ? isoDate(new Date(date.getTime() + count * dayMs)) : ''; }
export function rentalDays(pickup: string, returnDate: string) {
  const start = parseISODate(pickup), end = parseISODate(returnDate);
  return start && end ? Math.round((end.getTime() - start.getTime()) / dayMs) : 0;
}
export function formatDate(value: string) {
  const date = parseISODate(value);
  return date ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date) : '';
}
export function dateError(pickup: string, returnDate: string, today = todayInLondon()) {
  if (!parseISODate(pickup) || !parseISODate(returnDate)) return 'Choose valid pickup and return dates.';
  if (pickup < today) return 'Choose a pickup date from today onwards.';
  if (returnDate <= pickup) return 'Return must be after pickup.';
  return '';
}
export function rangeContainsBlocked(pickup: string, returnDate: string, blocked: string[]) {
  return blocked.some((day) => day >= pickup && day <= returnDate);
}
// Relative, deterministic example dates only. They do not represent live fleet inventory.
export function exampleBlockedDates(carIndex: number, today = todayInLondon()) {
  const first = 4 + (carIndex % 5);
  return [addDays(today, first), addDays(today, first + 1), addDays(today, 13 + (carIndex % 4))];
}
