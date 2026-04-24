type LatLng = { lat: number; lng: number };

/**
 * Decodes a Google Maps encoded polyline string into a list of coordinates.
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/** Haversine distance in metres between two coordinates. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinA = Math.sin(dLat / 2) ** 2;
  const sinB = Math.sin(dLng / 2) ** 2;
  const cosA = Math.cos((a.lat * Math.PI) / 180);
  const cosB = Math.cos((b.lat * Math.PI) / 180);
  return R * 2 * Math.asin(Math.sqrt(sinA + cosA * cosB * sinB));
}

/**
 * Returns the minimum distance in metres from a point to any segment
 * of the given polyline.
 */
export function distanceToPolyline(point: LatLng, polyline: LatLng[]): number {
  let min = Infinity;
  for (const p of polyline) {
    const d = haversineMeters(point, p);
    if (d < min) min = d;
  }
  return min;
}

/** Bounding box (south, west, north, east) from a list of points. */
export function boundingBox(points: LatLng[]): {
  south: number;
  west: number;
  north: number;
  east: number;
} {
  let south = Infinity, west = Infinity, north = -Infinity, east = -Infinity;
  for (const p of points) {
    if (p.lat < south) south = p.lat;
    if (p.lat > north) north = p.lat;
    if (p.lng < west) west = p.lng;
    if (p.lng > east) east = p.lng;
  }
  // Add a small margin (~500 m) so signs at the edge of the route are caught
  const margin = 0.005;
  return { south: south - margin, west: west - margin, north: north + margin, east: east + margin };
}
