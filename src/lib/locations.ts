export const locations = [
  { value: 'london-city', label: 'London City' },
  { value: 'heathrow', label: 'Heathrow' },
  { value: 'kings-cross', label: 'King’s Cross' },
] as const;

export const locationNames: Record<string, string> = Object.fromEntries(
  locations.map(({ value, label }) => [value, label]),
);
