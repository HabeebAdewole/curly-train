'use client';

import { useState } from 'react';
import { locationNames } from '@/lib/locations';

type Request = { id: string; reference: string; status: string; customerName: string; customerEmail: string; vehicle: string; pickup: string; returnDate: string; location: string; channel: string };

export function PilotStaffDesk({ initial }: { initial: Request[] }) {
  const [requests, setRequests] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  async function decide(id: string, decision: 'approved' | 'declined') {
    setBusy(id); setError('');
    try {
      const response = await fetch(`/api/pilot/staff/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decision }) });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || 'The decision could not be saved.');
      setRequests((current) => current.map((item) => item.id === id ? { ...item, status: decision } : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The decision could not be saved.'); } finally { setBusy(null); }
  }
  return <div className="pilot-staff-list">{error && <p className="booking-field-error" role="alert">{error}</p>}{requests.map((request) => <article key={request.id} className="pilot-staff-row"><div><span>{request.reference} · {request.channel}</span><h2>{request.vehicle}</h2><p>{request.pickup} to {request.returnDate} · {locationNames[request.location] || request.location}</p><p>{request.customerName} · {request.customerEmail}</p></div><div className="pilot-staff-actions"><strong>{request.status}</strong>{request.status === 'pending' && <><button type="button" disabled={busy === request.id} onClick={() => decide(request.id, 'approved')}>Approve</button><button type="button" disabled={busy === request.id} onClick={() => decide(request.id, 'declined')}>Decline</button></>}</div></article>)}{!requests.length && <p>No requests yet.</p>}</div>;
}
