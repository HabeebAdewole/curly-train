export type PaymentMode = 'simulation' | 'flutterwave';

// Flutterwave stays opt-in until an actual test account is available.
export function paymentMode(): PaymentMode {
  return process.env.PAYMENT_MODE === 'flutterwave' ? 'flutterwave' : 'simulation';
}
