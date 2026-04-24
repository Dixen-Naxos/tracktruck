import type { RoadSign, RoadSignType } from "../db/RoadSign.js";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

type OverpassElement = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

/**
 * Fetches truck-blocking road signs from OpenStreetMap via the Overpass API
 * for the given bounding box.
 *
 * Tags queried:
 *   hgv=no            → heavy goods vehicles forbidden
 *   maxheight=*       → height restriction (metres)
 *   maxweight=*       → weight restriction (tonnes)
 *   maxwidth=*        → width restriction (metres)
 */
export async function fetchRoadSignsFromOverpass(bbox: {
  south: number;
  west: number;
  north: number;
  east: number;
}): Promise<Omit<RoadSign, "_id">[]> {
  // Overpass bbox format: south,west,north,east
  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  const query = `
[out:json][timeout:20][maxsize:52428800];
(
  node["hgv"="no"](${bboxStr});
  node["maxheight"](${bboxStr});
  node["maxweight"](${bboxStr});
  node["maxwidth"](${bboxStr});
  way["hgv"="no"](${bboxStr});
  way["maxheight"](${bboxStr});
  way["maxweight"](${bboxStr});
  way["maxwidth"](${bboxStr});
);
out center tags qt;
  `.trim();

  let res: Response | null = null;
  let lastError = "";
  for (const baseUrl of OVERPASS_ENDPOINTS) {
    // Try GET first (most compatible), then POST as fallback
    const getUrl = `${baseUrl}?data=${encodeURIComponent(query)}`;
    try {
      res = await fetch(getUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (res.ok) break;
      lastError = `${res.status} from ${baseUrl} (GET)`;
      res = null;

      // fallback: POST
      res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json",
        },
        body: new URLSearchParams({ data: query }).toString(),
      });
      if (res.ok) break;
      lastError = `${res.status} from ${baseUrl} (POST)`;
      res = null;
    } catch (e) {
      lastError = `Network error on ${baseUrl}: ${e}`;
      res = null;
    }
  }

  if (!res) {
    console.warn(`[overpass] All endpoints failed: ${lastError}. Returning empty sign list.`);
    return [];
  }

  const data = (await res.json()) as OverpassResponse;
  const now = new Date();
  const signs: Omit<RoadSign, "_id">[] = [];

  for (const el of data.elements) {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;

    if (lat === undefined || lon === undefined) continue;

    const sign = parseSign(el.type, el.id, tags, lat, lon, now);
    if (sign) signs.push(sign);
  }

  return signs;
}

function parseSign(
  osmType: "node" | "way",
  osmId: number,
  tags: Record<string, string>,
  lat: number,
  lon: number,
  fetchedAt: Date,
): Omit<RoadSign, "_id"> | null {
  let type: RoadSignType;
  let value: number | undefined;

  if (tags.hgv === "no") {
    type = "hgv_forbidden";
  } else if (tags.maxheight) {
    type = "maxheight";
    value = parseMetric(tags.maxheight);
  } else if (tags.maxweight) {
    type = "maxweight";
    value = parseMetric(tags.maxweight);
  } else if (tags.maxwidth) {
    type = "maxwidth";
    value = parseMetric(tags.maxwidth);
  } else {
    return null;
  }

  return {
    osmId: `${osmId}`,
    osmType,
    type,
    value,
    location: { lat, lng: lon },
    tags,
    fetchedAt,
  };
}

/** Parses OSM metric values like "4.5", "4.5 m", "3'9\"" → number */
function parseMetric(raw: string): number | undefined {
  // Feet + inches: 3'9" → metres
  const feetInches = raw.match(/^(\d+)'(\d+)"?$/);
  if (feetInches) {
    return (parseInt(feetInches[1]) * 12 + parseInt(feetInches[2])) * 0.0254;
  }
  const num = parseFloat(raw);
  return isNaN(num) ? undefined : num;
}
