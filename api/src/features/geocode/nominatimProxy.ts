const NOMINATIM = "https://nominatim.openstreetmap.org";
const HEADERS = {
  "User-Agent": "TrackTruck/1.0 contact@tracktruck.fr",
  "Accept": "application/json",
};
const MIN_INTERVAL_MS = 1100;

let lastCallAt = 0;
const reverseCache = new Map<string, unknown>();
const searchCache  = new Map<string, unknown>();

async function throttledFetch(url: string): Promise<Response> {
  const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - Date.now());
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
  return fetch(url, { headers: HEADERS });
}

function reverseKey(lat: number, lon: number) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export async function proxyReverseGeocode(lat: number, lon: number): Promise<unknown> {
  const key = reverseKey(lat, lon);
  if (reverseCache.has(key)) return reverseCache.get(key);

  const res = await throttledFetch(
    `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`,
  );
  if (!res.ok) throw new Error(`Nominatim reverse: ${res.status}`);
  const data = await res.json();
  reverseCache.set(key, data);
  return data;
}

export async function proxySearchGeocode(q: string): Promise<unknown> {
  const key = q.trim().toLowerCase();
  if (searchCache.has(key)) return searchCache.get(key);

  const res = await throttledFetch(
    `${NOMINATIM}/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
  );
  if (!res.ok) throw new Error(`Nominatim search: ${res.status}`);
  const data = await res.json();
  searchCache.set(key, data);
  return data;
}
