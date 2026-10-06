// Approximate coordinates of common cities on the platform, used to estimate trip miles
// and to search "within X miles" of a city (like a load board's deadhead).
// Unknown cities simply show no distance.

const COORDS: Record<string, [number, number]> = {
  "omaha,NE": [41.2565, -95.9345], "lincoln,NE": [40.8136, -96.7026], "grand island,NE": [40.9264, -98.342],
  "kearney,NE": [40.6993, -99.0832], "norfolk,NE": [42.0283, -97.417], "columbus,NE": [41.4297, -97.3684],
  "north platte,NE": [41.1239, -100.7654], "scottsbluff,NE": [41.8666, -103.6672], "hastings,NE": [40.5862, -98.3899],
  "fremont,NE": [41.4333, -96.4981], "bellevue,NE": [41.1544, -95.9146], "papillion,NE": [41.1544, -96.0422],
  "la vista,NE": [41.1839, -96.0311], "south sioux city,NE": [42.4739, -96.4136], "lexington,NE": [40.7808, -99.7415],
  "york,NE": [40.8681, -97.592], "beatrice,NE": [40.2681, -96.747], "mccook,NE": [40.2022, -100.6254],
  "alliance,NE": [42.1016, -102.8721], "schuyler,NE": [41.4472, -97.0595], "crete,NE": [40.6278, -96.9614],
  "council bluffs,IA": [41.2619, -95.8608], "des moines,IA": [41.5868, -93.625], "sioux city,IA": [42.4999, -96.4003],
  "kansas city,MO": [39.0997, -94.5786], "kansas city,KS": [39.1141, -94.6275], "topeka,KS": [39.0473, -95.6752],
  "wichita,KS": [37.6872, -97.3301], "denver,CO": [39.7392, -104.9903], "cheyenne,WY": [41.14, -104.8202],
  "sioux falls,SD": [43.5446, -96.7311], "minneapolis,MN": [44.9778, -93.265], "chicago,IL": [41.8781, -87.6298],
}

export function coordsOf(city: string, state: string): [number, number] | null {
  return COORDS[`${city.trim().toLowerCase()},${state.trim().toUpperCase()}`] ?? null
}

/** Straight-line miles between two points. */
function haversineMiles([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Approximate road miles (straight line × 1.2). Null when a city is unknown. */
export function roadMiles(a: [number, number] | null, b: [number, number] | null): number | null {
  if (!a || !b) return null
  return Math.round(haversineMiles(a, b) * 1.2)
}

export const KNOWN_CITIES = Object.keys(COORDS).map((k) => {
  const [city, state] = k.split(",")
  return { city: city.replace(/\b\w/g, (c) => c.toUpperCase()), state }
})
