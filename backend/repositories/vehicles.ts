import 'server-only';

import { databasePool } from '../db/pool';

type VehicleRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  daily_rate_kobo: string;
  photo_url: string | null;
};

export async function publishedVehicles(operatorSlug: string) {
  const result = await databasePool().query<VehicleRow>(
    `SELECT v.id, v.slug, v.name, v.brand, v.category, v.seats,
            v.transmission, v.daily_rate_kobo, v.photo_url
       FROM vehicles v
       JOIN operators o ON o.id = v.operator_id
      WHERE o.slug = $1 AND v.status = 'active'
      ORDER BY v.name`,
    [operatorSlug],
  );

  return result.rows.map((vehicle) => ({
    id: vehicle.id,
    slug: vehicle.slug,
    name: vehicle.name,
    brand: vehicle.brand,
    category: vehicle.category,
    seats: vehicle.seats,
    transmission: vehicle.transmission,
    dailyRateKobo: vehicle.daily_rate_kobo,
    photoUrl: vehicle.photo_url,
  }));
}
