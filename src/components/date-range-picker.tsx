'use client';

import { useEffect, useRef, useState } from 'react';
import { addDays, dateError, formatDate, isoDate, parseISODate, rangeContainsBlocked, rentalDays, todayInLondon } from '@/lib/dates';

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export function DateRangePicker({ pickup, returnDate, onChange, blocked = [], compact = false }: {
  pickup: string;
  returnDate: string;
  onChange: (pickup: string, returnDate: string) => void;
  blocked?: string[];
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => { const date = parseISODate(pickup) || parseISODate(todayInLondon())!; return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)); });
  const [message, setMessage] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const today = todayInLondon();
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(month);
  const firstWeekday = (month.getUTCDay() + 6) % 7;
  const numberOfDays = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)).getUTCDate();
  const days = Array.from({ length: firstWeekday + numberOfDays }, (_, index) => index < firstWeekday ? '' : isoDate(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), index - firstWeekday + 1))));

  function close() { setOpen(false); setMessage(''); triggerRef.current?.focus(); }
  function shiftMonth(amount: number) { setMonth((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + amount, 1))); }
  function select(day: string) {
    if (!pickup || returnDate || day <= pickup) { onChange(day, ''); setMessage('Now choose a return date.'); return; }
    if (rangeContainsBlocked(pickup, day, blocked)) { setMessage('That range includes an example unavailable day. Choose another return date.'); return; }
    onChange(pickup, day); close();
  }

  useEffect(() => {
    if (!open) return;
    const active = dialogRef.current?.querySelector<HTMLElement>('.date-day.is-selected:not(:disabled), .date-day.is-today:not(:disabled), .date-day:not(:disabled)');
    active?.focus();
  }, [open, month]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key === 'Tab') {
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)') || []);
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index === 0) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0]?.focus(); }
      return;
    }
    const current = document.activeElement as HTMLButtonElement;
    if (!current?.dataset.day) return;
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next = moves[event.key] ? addDays(current.dataset.day, moves[event.key]) : '';
    if (event.key === 'Home') next = addDays(current.dataset.day, -((parseISODate(current.dataset.day)!.getUTCDay() + 6) % 7));
    if (event.key === 'End') next = addDays(current.dataset.day, 6 - ((parseISODate(current.dataset.day)!.getUTCDay() + 6) % 7));
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      const date = parseISODate(current.dataset.day)!;
      const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + (event.key === 'PageUp' ? -1 : 1), Math.min(date.getUTCDate(), 28)));
      next = isoDate(target);
    }
    if (!next) return;
    event.preventDefault();
    const nextDate = parseISODate(next)!;
    if (nextDate.getUTCMonth() !== month.getUTCMonth() || nextDate.getUTCFullYear() !== month.getUTCFullYear()) setMonth(new Date(Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), 1)));
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus());
  }

  return (
    <>
      <button type="button" ref={triggerRef} className={`date-trigger${compact ? ' date-trigger--compact' : ''}`} onClick={() => { setMonth(new Date(Date.UTC((parseISODate(pickup) || parseISODate(today)!).getUTCFullYear(), (parseISODate(pickup) || parseISODate(today)!).getUTCMonth(), 1))); setOpen(true); }} aria-haspopup="dialog" aria-expanded={open}>
        <span><small>Pickup</small><strong>{pickup ? formatDate(pickup) : 'Choose date'}</strong></span>
        <span className="date-trigger-divider" />
        <span><small>Return</small><strong>{returnDate ? formatDate(returnDate) : 'Choose date'}</strong></span>
      </button>
      {open && <div className="date-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="date-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="date-title" aria-describedby="date-instructions" onKeyDown={onKeyDown}>
          <div className="date-dialog-top"><div><p className="eyebrow">YOUR DATES</p><h2 id="date-title">Set the journey.</h2></div><button type="button" className="date-close" onClick={close} aria-label="Close date picker">×</button></div>
          <p id="date-instructions" className="date-instructions">Choose pickup, then return. Use arrow keys to move by day, Page Up or Down by month, and Escape to close.</p>
          <div className="date-month-head"><button type="button" onClick={() => shiftMonth(-1)} disabled={monthLabel === new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parseISODate(today)!)} aria-label="Previous month">‹</button><h3 aria-live="polite">{monthLabel}</h3><button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">›</button></div>
          <div className="date-grid">{weekdays.map((day) => <span className="date-weekday" key={day}>{day}</span>)}{days.map((day, index) => day ? <button type="button" key={day} data-day={day} disabled={day < today || blocked.includes(day)} aria-label={`${formatDate(day)}${blocked.includes(day) ? ', example unavailable' : ''}`} aria-pressed={day === pickup || day === returnDate} className={`date-day${day === pickup || day === returnDate ? ' is-selected' : ''}${pickup && returnDate && day > pickup && day < returnDate ? ' is-between' : ''}${day === today ? ' is-today' : ''}`} onClick={() => select(day)}>{Number(day.slice(-2))}</button> : <span key={`empty-${index}`} />)}</div>
          <div className="date-dialog-bottom"><span aria-live="polite">{message || (pickup && returnDate && !dateError(pickup, returnDate, today) ? `${rentalDays(pickup, returnDate)} calendar days selected` : 'Select two dates')}</span><button type="button" onClick={close}>Done</button></div>
          {blocked.length > 0 && <p className="date-example-note">Struck-through dates are example unavailable days for this demo car. Live availability is not connected.</p>}
        </div>
      </div>}
    </>
  );
}
