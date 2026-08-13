// Placeholder catalog data shaped to the `cities` and `activities` columns in
// docs/SCHEMA.md. Replace these imports with services/ calls at integration.
// ponytail: local types instead of types/database.ts, which is generated and Praneet's.

export type City = {
  id: number
  name: string
  country_code: string
  region: string | null
  timezone: string
  description: string | null
  image_url: string | null
  cost_index: number | null
  popularity_score: number
}

export type Activity = {
  id: number
  city_id: number
  name: string
  category: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'nightlife'
  description: string | null
  image_url: string | null
  duration_minutes: number | null
  estimated_cost: number
  currency_code: string
  popularity_score: number
}

export const cities: City[] = [
  {
    id: 1,
    name: 'Lisbon',
    country_code: 'PT',
    region: 'Southern Europe',
    timezone: 'Europe/Lisbon',
    description: 'Tiled facades, tram hills, and a river that turns gold at seven.',
    image_url: null,
    cost_index: 2.4,
    popularity_score: 940,
  },
  {
    id: 2,
    name: 'Barcelona',
    country_code: 'ES',
    region: 'Southern Europe',
    timezone: 'Europe/Madrid',
    description: 'Modernisme, a working port, and dinner that starts at ten.',
    image_url: null,
    cost_index: 3.1,
    popularity_score: 1180,
  },
  {
    id: 3,
    name: 'Florence',
    country_code: 'IT',
    region: 'Southern Europe',
    timezone: 'Europe/Rome',
    description: 'A compact renaissance city you can cross entirely on foot.',
    image_url: null,
    cost_index: 3.4,
    popularity_score: 870,
  },
  {
    id: 4,
    name: 'Porto',
    country_code: 'PT',
    region: 'Southern Europe',
    timezone: 'Europe/Lisbon',
    description: 'Granite, port cellars, and the least hurried river in Iberia.',
    image_url: null,
    cost_index: 2.1,
    popularity_score: 720,
  },
  {
    id: 5,
    name: 'Kyoto',
    country_code: 'JP',
    region: 'Kansai',
    timezone: 'Asia/Tokyo',
    description: 'Temple districts that empty completely by six in the evening.',
    image_url: null,
    cost_index: 3.6,
    popularity_score: 1320,
  },
  {
    id: 6,
    name: 'Reykjavik',
    country_code: 'IS',
    region: 'Capital Region',
    timezone: 'Atlantic/Reykjavik',
    description: 'A small capital used mostly as a door to everything around it.',
    image_url: null,
    cost_index: 4.6,
    popularity_score: 610,
  },
  {
    id: 7,
    name: 'Marrakesh',
    country_code: 'MA',
    region: 'Marrakesh-Safi',
    timezone: 'Africa/Casablanca',
    description: 'A walled medina that rearranges itself every time you enter.',
    image_url: null,
    cost_index: 1.8,
    popularity_score: 830,
  },
  {
    id: 8,
    name: 'Ljubljana',
    country_code: 'SI',
    region: 'Central Slovenia',
    timezone: 'Europe/Ljubljana',
    description: 'A river, a castle hill, and almost no traffic in the centre.',
    image_url: null,
    cost_index: 2.2,
    popularity_score: 430,
  },
  {
    id: 9,
    name: 'Tbilisi',
    country_code: 'GE',
    region: 'Kartli',
    timezone: 'Asia/Tbilisi',
    description: 'Sulphur baths, balconied old town, and a serious wine habit.',
    image_url: null,
    cost_index: 1.6,
    popularity_score: 520,
  },
  {
    id: 10,
    name: 'Copenhagen',
    country_code: 'DK',
    region: 'Hovedstaden',
    timezone: 'Europe/Copenhagen',
    description: 'Flat, cyclable, and organised to within an inch of its life.',
    image_url: null,
    cost_index: 4.2,
    popularity_score: 990,
  },
]

export const activities: Activity[] = [
  { id: 1, city_id: 1, name: 'Tram 28 end to end', category: 'sightseeing', description: 'The full loop before the queues build at Martim Moniz.', image_url: null, duration_minutes: 75, estimated_cost: 3, currency_code: 'EUR', popularity_score: 610 },
  { id: 2, city_id: 1, name: 'Time Out Market lunch', category: 'food', description: 'One hall, most of the city’s better kitchens.', image_url: null, duration_minutes: 90, estimated_cost: 24, currency_code: 'EUR', popularity_score: 720 },
  { id: 3, city_id: 1, name: 'Belem tower and pasteis', category: 'sightseeing', description: 'Waterfront monuments, then the original custard tarts.', image_url: null, duration_minutes: 180, estimated_cost: 18, currency_code: 'EUR', popularity_score: 680 },
  { id: 4, city_id: 1, name: 'Sunset at Miradouro da Senhora do Monte', category: 'sightseeing', description: 'The highest of the free viewpoints, and the least crowded.', image_url: null, duration_minutes: 60, estimated_cost: 0, currency_code: 'EUR', popularity_score: 540 },
  { id: 5, city_id: 2, name: 'Sagrada Familia', category: 'culture', description: 'Book the first slot; the east windows do the work in the morning.', image_url: null, duration_minutes: 120, estimated_cost: 26, currency_code: 'EUR', popularity_score: 1490 },
  { id: 6, city_id: 2, name: 'Park Guell terrace', category: 'sightseeing', description: 'The monumental zone needs a timed ticket, the rest does not.', image_url: null, duration_minutes: 150, estimated_cost: 10, currency_code: 'EUR', popularity_score: 1020 },
  { id: 7, city_id: 2, name: 'El Born tapas crawl', category: 'food', description: 'Four bars, standing room only, no reservations anywhere.', image_url: null, duration_minutes: 180, estimated_cost: 45, currency_code: 'EUR', popularity_score: 880 },
  { id: 8, city_id: 2, name: 'Montjuic cable car', category: 'adventure', description: 'Harbour views on the way up to the castle.', image_url: null, duration_minutes: 90, estimated_cost: 14, currency_code: 'EUR', popularity_score: 470 },
  { id: 9, city_id: 3, name: 'Uffizi Gallery', category: 'culture', description: 'Three hours minimum. Skip-the-line is worth it here.', image_url: null, duration_minutes: 180, estimated_cost: 25, currency_code: 'EUR', popularity_score: 1240 },
  { id: 10, city_id: 3, name: 'Duomo cupola climb', category: 'adventure', description: '463 steps, timed entry, no bags allowed.', image_url: null, duration_minutes: 90, estimated_cost: 30, currency_code: 'EUR', popularity_score: 1100 },
  { id: 11, city_id: 3, name: 'Oltrarno workshops', category: 'culture', description: 'Leather and gilding studios still working on the south bank.', image_url: null, duration_minutes: 120, estimated_cost: 0, currency_code: 'EUR', popularity_score: 390 },
  { id: 12, city_id: 3, name: 'Mercato Centrale dinner', category: 'food', description: 'Upstairs, after the produce floor closes.', image_url: null, duration_minutes: 90, estimated_cost: 28, currency_code: 'EUR', popularity_score: 560 },
  { id: 13, city_id: 4, name: 'Port cellar tasting', category: 'food', description: 'Vila Nova de Gaia side, across the bridge.', image_url: null, duration_minutes: 90, estimated_cost: 22, currency_code: 'EUR', popularity_score: 640 },
  { id: 14, city_id: 4, name: 'Livraria Lello', category: 'culture', description: 'Ticket price comes off a book if you buy one.', image_url: null, duration_minutes: 45, estimated_cost: 8, currency_code: 'EUR', popularity_score: 700 },
  { id: 15, city_id: 5, name: 'Fushimi Inari at dawn', category: 'sightseeing', description: 'Before seven the gates are genuinely empty.', image_url: null, duration_minutes: 150, estimated_cost: 0, currency_code: 'JPY', popularity_score: 1580 },
  { id: 16, city_id: 5, name: 'Nishiki Market', category: 'food', description: 'Five covered blocks of prepared food and knives.', image_url: null, duration_minutes: 90, estimated_cost: 2200, currency_code: 'JPY', popularity_score: 910 },
  { id: 17, city_id: 5, name: 'Arashiyama bamboo grove', category: 'sightseeing', description: 'Pair it with the monkey park on the same morning.', image_url: null, duration_minutes: 120, estimated_cost: 0, currency_code: 'JPY', popularity_score: 1210 },
  { id: 18, city_id: 6, name: 'Blue Lagoon', category: 'adventure', description: 'Pre-booked slots only, and it is on the airport road.', image_url: null, duration_minutes: 180, estimated_cost: 9500, currency_code: 'ISK', popularity_score: 880 },
  { id: 19, city_id: 6, name: 'Golden Circle day loop', category: 'adventure', description: 'Thingvellir, Geysir, Gullfoss. Long day, one car.', image_url: null, duration_minutes: 480, estimated_cost: 12000, currency_code: 'ISK', popularity_score: 1040 },
  { id: 20, city_id: 7, name: 'Jemaa el-Fnaa after dark', category: 'nightlife', description: 'The square only becomes itself once the food stalls open.', image_url: null, duration_minutes: 120, estimated_cost: 80, currency_code: 'MAD', popularity_score: 970 },
  { id: 21, city_id: 7, name: 'Jardin Majorelle', category: 'sightseeing', description: 'Go at opening; it is small and it fills fast.', image_url: null, duration_minutes: 90, estimated_cost: 160, currency_code: 'MAD', popularity_score: 820 },
  { id: 22, city_id: 8, name: 'Ljubljana castle funicular', category: 'sightseeing', description: 'Two minutes up, an hour of ramparts at the top.', image_url: null, duration_minutes: 120, estimated_cost: 13, currency_code: 'EUR', popularity_score: 350 },
  { id: 23, city_id: 9, name: 'Abanotubani sulphur bath', category: 'adventure', description: 'Private rooms by the hour in the old bath district.', image_url: null, duration_minutes: 90, estimated_cost: 60, currency_code: 'GEL', popularity_score: 480 },
  { id: 24, city_id: 10, name: 'Harbour bike loop', category: 'adventure', description: 'Rent anywhere; the whole waterfront is separated lanes.', image_url: null, duration_minutes: 150, estimated_cost: 120, currency_code: 'DKK', popularity_score: 590 },
]

export const cityById = new Map(cities.map((city) => [city.id, city]))

export function activitiesForCity(cityId: number) {
  return activities.filter((activity) => activity.city_id === cityId)
}
