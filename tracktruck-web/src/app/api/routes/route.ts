// Server route that proxies the Google Routes API. The Google API key stays
// on the server (env var GOOGLE_MAPS_SERVER_KEY) and is never shipped to the
// browser. The endpoint returns a decoded polyline that the front-end can
// drop straight into a Leaflet `<Polyline>`.
//
// Docs: https://developers.google.com/maps/documentation/routes/compute_route_directions

import { NextResponse } from "next/server";
import { decodePolyline } from "@/lib/polyline";
import type { LatLng } from "@/lib/trucks-live";

interface RequestBody {
  origin: LatLng;
  destination: LatLng;
  /** Intermediate waypoints, in order. */
  waypoints?: LatLng[];
  travelMode?: "DRIVE" | "BICYCLE" | "WALK" | "TWO_WHEELER" | "TRANSIT";
}

interface RoutesApiResponse {
  routes?: {
    distanceMeters?: number;
    duration?: string; // e.g. "172s"
    polyline?: { encodedPolyline?: string };
  }[];
  error?: { message?: string; code?: number };
}

const ROUTES_ENDPOINT =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const FIELD_MASK =
  "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline";

function toWaypoint([lat, lng]: LatLng) {
  return { location: { latLng: { latitude: lat, longitude: lng } } };
}

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_SERVER_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !Array.isArray(body.origin) ||
    body.origin.length !== 2 ||
    !Array.isArray(body.destination) ||
    body.destination.length !== 2
  ) {
    return NextResponse.json(
      { error: "Both `origin` and `destination` must be [lat, lng] tuples." },
      { status: 400 },
    );
  }

  const payload = {
    origin: toWaypoint(body.origin),
    destination: toWaypoint(body.destination),
    intermediates: (body.waypoints ?? []).map(toWaypoint),
    travelMode: body.travelMode ?? "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    polylineQuality: "HIGH_QUALITY",
  };

  let google: Response;
  try {
    google = await fetch(ROUTES_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(payload),
      // Routes are time-sensitive — never cache.
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to reach Google Routes API",
        cause: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  const json = (await google.json()) as RoutesApiResponse;

  if (!google.ok || json.error) {
    return NextResponse.json(
      {
        error: json.error?.message ?? "Google Routes API error",
        status: google.status,
      },
      { status: google.status || 502 },
    );
  }

  const route = json.routes?.[0];
  const encoded = route?.polyline?.encodedPolyline;
  if (!encoded) {
    return NextResponse.json(
      { error: "No route returned by Google" },
      { status: 404 },
    );
  }

  const path = decodePolyline(encoded);
  const durationSeconds = route?.duration
    ? Number(route.duration.replace(/s$/, ""))
    : null;

  return NextResponse.json({
    path,
    distanceMeters: route?.distanceMeters ?? null,
    durationSeconds,
  });
}
