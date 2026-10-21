export const locations = [
  { value: 'lagos-vi', label: 'Victoria Island', city: 'Lagos' },
  { value: 'lagos-ikoyi', label: 'Ikoyi', city: 'Lagos' },
  { value: 'lagos-lekki-phase-1', label: 'Lekki Phase 1', city: 'Lagos' },
  { value: 'lagos-ajah', label: 'Ajah', city: 'Lagos' },
  { value: 'lagos-ikeja', label: 'Ikeja', city: 'Lagos' },
  { value: 'lagos-airport', label: 'Murtala Muhammed Airport', city: 'Lagos' },
  { value: 'lagos-yaba', label: 'Yaba', city: 'Lagos' },
  { value: 'lagos-surulere', label: 'Surulere', city: 'Lagos' },
  { value: 'lagos-maryland', label: 'Maryland', city: 'Lagos' },
  { value: 'lagos-magodo', label: 'Magodo', city: 'Lagos' },
  { value: 'lagos-ikate', label: 'Ikate', city: 'Lagos' },
  { value: 'lagos-chevron', label: 'Chevron', city: 'Lagos' },
  { value: 'lagos-osapa', label: 'Osapa', city: 'Lagos' },
  { value: 'abuja-central', label: 'Central Area', city: 'Abuja' },
  { value: 'abuja-maitama', label: 'Maitama', city: 'Abuja' },
  { value: 'abuja-wuse-2', label: 'Wuse 2', city: 'Abuja' },
  { value: 'abuja-asokoro', label: 'Asokoro', city: 'Abuja' },
  { value: 'abuja-garki', label: 'Garki', city: 'Abuja' },
  { value: 'abuja-jabi', label: 'Jabi', city: 'Abuja' },
  { value: 'abuja-utako', label: 'Utako', city: 'Abuja' },
  { value: 'abuja-gwarinpa', label: 'Gwarinpa', city: 'Abuja' },
  { value: 'abuja-lugbe', label: 'Lugbe', city: 'Abuja' },
  { value: 'abuja-airport', label: 'Nnamdi Azikiwe Airport', city: 'Abuja' },
] as const;

export const locationCities = ['Lagos', 'Abuja'] as const;
export const locationNames: Record<string, string> = Object.fromEntries(
  locations.map(({ value, label, city }) => [value, `${label}, ${city}`]),
);
