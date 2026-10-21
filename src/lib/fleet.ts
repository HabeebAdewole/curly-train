export const categories = ['Performance', 'Executive', 'SUV', 'Electric'] as const;
export type CarCategory = (typeof categories)[number];

export type Car = {
  id: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: CarCategory;
  image: string;
  alt: string;
  position?: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  dailyRate: number;
  interior?: string;
  interiorAlt?: string;
  character: string;
  highlights: string[];
};

// Demo specifications and rates are illustrative. Photos show the named model
// family; they are not photographs of a real Rinjo vehicle or live inventory.
export const fleet: Car[] = [
  { id: 'mercedes-s-class', name: 'Mercedes-Benz S-Class', brand: 'Mercedes-Benz', brandSlug: 'mercedes-benz', category: 'Executive', image: '/media/mercedes-s-class.webp', alt: 'Graphite Mercedes-Benz S-Class against a pale studio backdrop', seats: 5, transmission: 'Automatic', dailyRate: 320000, interior: '/media/interior-mercedes-s.webp', interiorAlt: 'Light-coloured Mercedes-Benz S-Class front cabin', character: 'A quieter kind of arrival, with comfort at the centre of every mile.', highlights: ['Refined long-distance comfort', 'Generous rear-seat space', 'Confident city presence'] },
  { id: 'porsche-911-turbo-s', name: 'Porsche 911 Turbo S', brand: 'Porsche', brandSlug: 'porsche', category: 'Performance', image: '/media/porsche-911-turbo-s.webp', alt: 'Matte black Porsche 911 Turbo S parked outdoors', seats: 4, transmission: 'Automatic', dailyRate: 600000, interior: '/media/interior-porsche-911.webp', interiorAlt: 'Dark Porsche 911 Turbo cabin', character: 'An unmistakable silhouette and a drive made to be remembered.', highlights: ['Four-seat sports car', 'Driver-focused cabin', 'Signature 911 profile'] },
  { id: 'ford-mustang', name: 'Ford Mustang', brand: 'Ford', brandSlug: 'ford', category: 'Performance', image: '/media/ford-mustang-blue.webp', alt: 'Blue Ford Mustang in side profile beneath an open sky', seats: 4, transmission: 'Automatic', dailyRate: 250000, interior: '/media/interior-ford-mustang.webp', interiorAlt: 'Ford Mustang front cabin and steering wheel', character: 'The long-road mood, ready for a new route.', highlights: ['Expressive coupe design', 'Four-seat cabin', 'Open-road character'] },
  { id: 'tesla-model-3', name: 'Tesla Model 3', brand: 'Tesla', brandSlug: 'tesla', category: 'Electric', image: '/media/tesla-model-3.webp', alt: 'White Tesla Model 3 driving along a quiet road', seats: 5, transmission: 'Automatic', dailyRate: 190000, interior: '/media/interior-tesla-model-3.webp', interiorAlt: 'Minimal Tesla Model 3 dashboard and centre screen', character: 'Clean lines and an easy electric rhythm.', highlights: ['Fully electric drive', 'Minimal cabin', 'Five-seat versatility'] },
  { id: 'mercedes-g-class', name: 'Mercedes-Benz G-Class', brand: 'Mercedes-Benz', brandSlug: 'mercedes-benz', category: 'SUV', image: '/media/mercedes-g.webp', alt: 'Silver Mercedes-Benz G-Class shown from the side', seats: 5, transmission: 'Automatic', dailyRate: 500000, interior: '/media/interior-mercedes-g.webp', interiorAlt: 'Mercedes-Benz G-Class dashboard and front cabin', character: 'A singular shape with room to make a statement.', highlights: ['Iconic upright form', 'Elevated driving position', 'Five-seat cabin'] },
  { id: 'audi-rs6', name: 'Audi RS6 Avant', brand: 'Audi', brandSlug: 'audi', category: 'Performance', image: '/media/audi-rs6.webp', alt: 'Dark Audi RS6 Avant on a wet road at dusk', seats: 5, transmission: 'Automatic', dailyRate: 390000, interior: '/media/interior-audi-rs6.webp', interiorAlt: 'Audi RS6 cabin with steering wheel and dashboard', character: 'Everyday space with an altogether different pulse.', highlights: ['Performance estate', 'Five-seat practicality', 'Understated profile'] },
  { id: 'toyota-highlander', name: 'Toyota Highlander', brand: 'Toyota', brandSlug: 'toyota', category: 'SUV', image: '/media/toyota-highlander.webp', alt: 'White Toyota Highlander in side profile against brick', seats: 7, transmission: 'Automatic', dailyRate: 180000, character: 'Space for the longer plan and everyone coming along.', highlights: ['Seven-seat layout', 'Flexible family space', 'Easy long-trip character'] },
  { id: 'bmw-m4', name: 'BMW M4', brand: 'BMW', brandSlug: 'bmw', category: 'Performance', image: '/media/bmw-m4.webp', alt: 'Dark BMW M4 with sculpted bonnet and front wheel visible', seats: 4, transmission: 'Automatic', dailyRate: 360000, interior: '/media/interior-bmw-m4.webp', interiorAlt: 'BMW M4 steering wheel and front cabin', character: 'A focused coupe with a strong sense of occasion.', highlights: ['Performance coupe', 'Driver-led proportions', 'Four-seat cabin'] },
  { id: 'audi-a4', name: 'Audi A4', brand: 'Audi', brandSlug: 'audi', category: 'Executive', image: '/media/audi-a4.webp', alt: 'Silver Audi A4 on a quiet roadside', position: '40% center', seats: 5, transmission: 'Automatic', dailyRate: 150000, character: 'A composed choice for the everyday journey.', highlights: ['Comfortable saloon', 'Five-seat cabin', 'Understated finish'] },
  { id: 'lexus-nx', name: 'Lexus NX', brand: 'Lexus', brandSlug: 'lexus', category: 'SUV', image: '/media/lexus-suv.webp', alt: 'Blue Lexus SUV parked in an open lot', seats: 5, transmission: 'Automatic', dailyRate: 210000, interior: '/media/interior-lexus-nx.webp', interiorAlt: 'Lexus NX front cabin and dashboard', character: 'A considered balance of city ease and open-road comfort.', highlights: ['Mid-size SUV', 'Five-seat cabin', 'Elevated view'] },
  { id: 'ford-mustang-gt', name: 'Ford Mustang GT', brand: 'Ford', brandSlug: 'ford', category: 'Performance', image: '/media/ford-mustang-white.webp', alt: 'White Ford Mustang photographed in motion at golden hour', seats: 4, transmission: 'Manual', dailyRate: 280000, interior: '/media/interior-ford-mustang.webp', interiorAlt: 'Ford Mustang front cabin and steering wheel', character: 'A little theatre for the road ahead.', highlights: ['Manual drive', 'Four-seat coupe', 'Classic muscle-car shape'] },
  { id: 'bmw-m4-coupe', name: 'BMW M4 Coupé', brand: 'BMW', brandSlug: 'bmw', category: 'Performance', image: '/media/bmw-m4-white.webp', alt: 'White BMW M4 photographed from behind on a city street', seats: 4, transmission: 'Automatic', dailyRate: 340000, interior: '/media/interior-bmw-m4.webp', interiorAlt: 'BMW M4 steering wheel and front cabin', character: 'The same unmistakable energy, seen from another angle.', highlights: ['Performance coupe', 'Four-seat cabin', 'Responsive feel'] },
];

export const brandNames: Record<string, string> = { porsche: 'Porsche', bmw: 'BMW', 'mercedes-benz': 'Mercedes-Benz', toyota: 'Toyota', ford: 'Ford', audi: 'Audi', tesla: 'Tesla', volkswagen: 'Volkswagen', honda: 'Honda', nissan: 'Nissan', chevrolet: 'Chevrolet', hyundai: 'Hyundai', kia: 'Kia', volvo: 'Volvo', renault: 'Renault', mazda: 'Mazda', lexus: 'Lexus' };

export function carById(id: string) { return fleet.find((car) => car.id === id); }
