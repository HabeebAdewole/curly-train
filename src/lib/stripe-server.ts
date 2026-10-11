import Stripe from 'stripe';

export function testStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_test_') || key === 'sk_test_replace_me') return null;
  return new Stripe(key);
}

export function appBaseUrl() {
  const value = process.env.APP_BASE_URL;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) return null;
    return url.origin;
  } catch { return null; }
}
