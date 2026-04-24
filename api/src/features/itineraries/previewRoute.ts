import { HTTPException } from "hono/http-exception";
import type { LatLng } from "../../services/geocode.js";

const ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

export type PreviewRouteInput = {
  origin: LatLng;
  stops: LatLng[];
};

export type PreviewRouteResult = {
  polyline: [number, number][];
  totalDistanceKilometers: number;
  totalDurationSeconds: number;
};

function toGoogleLatLng(point: LatLng) {
  return { location: { latLng: { latitude: point.lat, longitude: point.lng } } };
}

function decodePolyline(encoded: string): [number, number][] {
  const result: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let val = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      val |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (val & 1) !== 0 ? ~(val >> 1) : val >> 1;

    shift = 0;
    val = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      val |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (val & 1) !== 0 ? ~(val >> 1) : val >> 1;

    result.push([lat / 1e5, lng / 1e5]);
  }

  return result;
}

export async function previewRoute(
  input: PreviewRouteInput,
): Promise<PreviewRouteResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

  const { origin, stops } = input;

  const res = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.polyline.encodedPolyline,routes.legs.distanceMeters,routes.legs.duration",
    },
    body: JSON.stringify({
      origin: toGoogleLatLng(origin),
      destination: toGoogleLatLng(origin),
      intermediates: stops.map(toGoogleLatLng),
      travelMode: "DRIVE",
      optimizeWaypointOrder: false,
      routingPreference: "TRAFFIC_AWARE",
      languageCode: "fr-FR",
      units: "METRIC",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPException(502, {
      message: `Google Routes API error: ${res.status} ${text}`,
    });
  }

  const data = (await res.json()) as {
    routes?: Array<{
      polyline?: { encodedPolyline: string };
      legs: Array<{ distanceMeters?: number; duration?: string }>;
    }>;
  };

  const route = data.routes?.[0];
  if (!route) throw new HTTPException(502, { message: "No route returned by Google" });

  const polyline = route.polyline?.encodedPolyline
    ? decodePolyline(route.polyline.encodedPolyline)
    : [];

  const totalDistanceKilometers =
    route.legs.reduce((sum, leg) => sum + (leg.distanceMeters ?? 0), 0) / 1000;

  const totalDurationSeconds = route.legs.reduce((sum, leg) => {
    const s = parseInt((leg.duration ?? "0s").replace("s", ""), 10);
    return sum + (isNaN(s) ? 0 : s);
  }, 0);

  return { polyline, totalDistanceKilometers, totalDurationSeconds };
}
