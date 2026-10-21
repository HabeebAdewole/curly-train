// Namespaces local demonstration state for the signed-in account. This hash
// is only an identifier; browser session storage is not a security boundary.
export function customerSessionKey(kind: 'bookings' | 'driver', email: string) {
  let hash = 2166136261;
  for (const char of email.trim().toLowerCase()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `rinjo-example-${kind}-${(hash >>> 0).toString(36)}-v1`;
}
