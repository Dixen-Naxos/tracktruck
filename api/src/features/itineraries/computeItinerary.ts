import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import type { LatLng } from "../../services/geocode.js";
import { stores } from "../../db/Store.js";
import { warehouses } from "../../db/Warehouse.js";
import { roadSigns, type RoadSign } from "../../db/RoadSign.js";
import {
  decodePolyline,
  distanceToPolyline,
  boundingBox,
} from "../../utils/polyline.js";
import { fetchRoadSignsFromOverpass } from "../../services/overpass.js";

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

/** A truck's physical/weight characteristics used to evaluate restrictions. */
export type TruckProfile = {
  heightMeters: number;   // default 4.0 m
  weightTonnes: number;   // default 26 t
  widthMeters: number;    // default 2.55 m
};

const DEFAULT_TRUCK: TruckProfile = {
  heightMeters: 4.0,
  weightTonnes: 26,
  widthMeters: 2.55,
};

/** Max distance (metres) from route polyline for a sign to be considered "on route" */
const ON_ROUTE_THRESHOLD_M = 30;

export type ComputeItineraryInput = {
  startPointId: ObjectId;
  toVisitIds: ObjectId[];
  truck?: Partial<TruckProfile>;
  /** Planned departure time — used for traffic-aware routing. Defaults to now. */
  departureTime?: Date;
};

export type ItineraryStop = {
  id: string;
  name: string;
  address: string;
  location: LatLng;
};

export type BlockingSign = {
  osmId: string;
  type: RoadSign["type"];
  value?: number;
  location: LatLng;
};

export type ComputeItineraryResult = {
  totalDistanceKilometers: number;
  totalDurationSeconds: number;
  orderedStops: ItineraryStop[];
  orderedStopIds: ObjectId[];
  /** Signs that would block the truck, if any (empty = route is safe) */
  blockingSigns: BlockingSign[];
  /** True if the route was recomputed to avoid blocking signs */
  wasRerouted: boolean;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type ResolvedPoint = { address: string; name: string; location: LatLng };

async function resolvePoint(id: ObjectId): Promise<ResolvedPoint> {
  const warehouse = await warehouses.findOne({ _id: id });
  if (warehouse) return { address: warehouse.address, name: warehouse.name, location: warehouse.location };

  const store = await stores.findOne({ _id: id });
  if (store) return { address: store.address, name: store.name, location: store.location };

  throw new HTTPException(404, { message: `No warehouse or store found for id ${id}` });
}

type GoogleRoute = {
  legs: Array<{ distanceMeters: number; duration: string }>;
  optimizedIntermediateWaypointIndex?: number[];
  polyline?: { encodedPolyline: string };
};

type GoogleRoutesResponse = { routes?: GoogleRoute[] };

async function callRoutesApi(
  apiKey: string,
  origin: string,
  destination: string,
  intermediates: string[],
  departureTime: Date,
): Promise<GoogleRoute> {
  const res = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "routes.legs.distanceMeters",
        "routes.legs.duration",
        "routes.optimizedIntermediateWaypointIndex",
        "routes.polyline.encodedPolyline",
      ].join(","),
    },
    body: JSON.stringify({
      origin: { address: origin },
      destination: { address: destination },
      intermediates: intermediates.map((address) => ({ address })),
      travelMode: "DRIVE",
      optimizeWaypointOrder: true,
      routingPreference: "TRAFFIC_AWARE",
      departureTime: departureTime.toISOString(),
      languageCode: "fr-FR",
      units: "METRIC",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new HTTPException(502, { message: `Google Routes API error: ${res.status} ${text}` });
  }

  const data = (await res.json()) as GoogleRoutesResponse;
  const route = data.routes?.[0];
  if (!route) throw new HTTPException(502, { message: "No route returned by Google" });
  return route;
}

function isSignBlockingTruck(sign: RoadSign, truck: TruckProfile): boolean {
  if (sign.type === "hgv_forbidden") return true;
  if (sign.type === "maxheight" && sign.value !== undefined)
    return truck.heightMeters > sign.value;
  if (sign.type === "maxweight" && sign.value !== undefined)
    return truck.weightTonnes > sign.value;
  if (sign.type === "maxwidth" && sign.value !== undefined)
    return truck.widthMeters > sign.value;
  return false;
}

async function findSignsAlongRoute(
  polylinePoints: Array<{ lat: number; lng: number }>,
  truck: TruckProfile,
): Promise<BlockingSign[]> {
  if (polylinePoints.length === 0) return [];

  const bbox = boundingBox(polylinePoints);

  // 1. Check cached signs in MongoDB first
  let candidateSigns = await roadSigns
    .find({
      "location.lat": { $gte: bbox.south, $lte: bbox.north },
      "location.lng": { $gte: bbox.west, $lte: bbox.east },
    })
    .toArray();

  // 2. If cache is empty, fetch live from Overpass and store
  if (candidateSigns.length === 0) {
    const fresh = await fetchRoadSignsFromOverpass(bbox);
    if (fresh.length > 0) {
      const { ObjectId: ObjId } = await import("mongodb");
      const docs = fresh.map((s) => ({ ...s, _id: new ObjId() }));
      await roadSigns
        .insertMany(docs as any, { ordered: false })
        .catch(() => {}); // ignore duplicate key errors on concurrent calls
      candidateSigns = docs as any;
    }
  }

  // 3. Keep only signs actually on the route and blocking this truck
  const blocking: BlockingSign[] = [];
  for (const sign of candidateSigns) {
    if (!isSignBlockingTruck(sign, truck)) continue;
    const dist = distanceToPolyline(sign.location, polylinePoints);
    if (dist <= ON_ROUTE_THRESHOLD_M) {
      blocking.push({
        osmId: sign.osmId,
        type: sign.type,
        value: sign.value,
        location: sign.location,
      });
    }
  }

  return blocking;
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export async function computeItinerary(
  input: ComputeItineraryInput,
): Promise<ComputeItineraryResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

  const truck: TruckProfile = { ...DEFAULT_TRUCK, ...input.truck };
  const { startPointId, toVisitIds, departureTime = departureTime ? departureTime : new Date(Date.now() + 60_000) } = input;

  const startPoint = await resolvePoint(startPointId);
  const stopPoints = await Promise.all(toVisitIds.map(resolvePoint));

  // --- First route computation ---
  let route = await callRoutesApi(
    apiKey,
    startPoint.address,
    startPoint.address,
    stopPoints.map((s) => s.address),
    departureTime,
  );

  const polylinePoints = route.polyline?.encodedPolyline
    ? decodePolyline(route.polyline.encodedPolyline)
    : [];

  // --- Check road signs ---
  let blockingSigns = await findSignsAlongRoute(polylinePoints, truck);
  let wasRerouted = false;
  let avoidCount = 0;

  // --- Reroute if blocking signs found ---
  if (blockingSigns.length > 0) {
    // Strategy: add the blocking sign locations as "via" waypoints slightly
    // offset so Google routes around them. We use a 200 m northward nudge.
    const NUDGE = 0.002; // ~200 m in degrees
    const avoidVia = blockingSigns.map((s) => ({
      lat: s.location.lat + NUDGE,
      lng: s.location.lng,
    }));
    avoidCount = avoidVia.length;

    // Rebuild intermediates interleaving avoid-waypoints before each stop
    const reroutedIntermediates = [
      ...avoidVia.map((p) => `${p.lat},${p.lng}`),
      ...stopPoints.map((s) => s.address),
    ];

    try {
      const reroutedRoute = await callRoutesApi(
        apiKey,
        startPoint.address,
        startPoint.address,
        reroutedIntermediates,
        departureTime,
      );

      const newPolyline = reroutedRoute.polyline?.encodedPolyline
        ? decodePolyline(reroutedRoute.polyline.encodedPolyline)
        : [];

      const remainingSigns = await findSignsAlongRoute(newPolyline, truck);

      // Accept the rerouted path even if some signs remain (best effort)
      route = reroutedRoute;
      blockingSigns = remainingSigns;
      wasRerouted = true;
    } catch {
      // Reroute failed → return original route with warnings
    }
  }

  // --- Extract final metrics ---
  const totalDistanceKilometers =
    route.legs.reduce((sum, leg) => sum + (leg.distanceMeters || 0), 0) / 1000;

  const totalDurationSeconds = route.legs.reduce((sum, leg) => {
    const s = parseInt(leg.duration.replace("s", ""), 10);
    return sum + (isNaN(s) ? 0 : s);
  }, 0);

  const optimizedIndexes = route.optimizedIntermediateWaypointIndex;

  let orderedStopPoints: ResolvedPoint[];
  let orderedStopIds: ObjectId[];

  if (optimizedIndexes) {
    // When rerouting, intermediates include avoid-via waypoints first (indices
    // 0..avoidCount-1) followed by real stops (indices avoidCount..n-1).
    // We must filter to stop indices only and subtract the avoid offset.
    const stopIndexes = wasRerouted
      ? optimizedIndexes.filter((i) => i >= avoidCount).map((i) => i - avoidCount)
      : optimizedIndexes.slice(0, stopPoints.length);
    orderedStopPoints = stopIndexes.map((i) => stopPoints[i]);
    orderedStopIds = stopIndexes.map((i) => toVisitIds[i]);
  } else {
    orderedStopPoints = stopPoints;
    orderedStopIds = [...toVisitIds];
  }

  const orderedStops: ItineraryStop[] = orderedStopPoints.map((stop, i) => ({
    id: orderedStopIds[i].toHexString(),
    name: stop.name,
    address: stop.address,
    location: stop.location,
  }));

  return {
    totalDistanceKilometers,
    totalDurationSeconds,
    orderedStops,
    orderedStopIds,
    blockingSigns,
    wasRerouted,
  };
}
