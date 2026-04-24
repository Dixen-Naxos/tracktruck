import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import type { LatLng } from "../../services/geocode.js";
import { stores } from "../../db/Store.js";
import { warehouses } from "../../db/Warehouse.js";

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

/**
 * A point on the map we can send to Google Routes. It may originate from a
 * Store/Warehouse document (existingStoreId set) or be ad-hoc (coordinates
 * typed or picked from the map).
 */
export type ItineraryWaypoint = {
  name: string;
  address: string;
  location: LatLng;
  existingStoreId?: ObjectId;
};

export type ComputeItineraryInput = {
  start: ItineraryWaypoint;
  stops: ItineraryWaypoint[];
};

export type ComputeItineraryResult = {
  totalDistanceKilometers: number;
  totalDurationSeconds: number;
  /** Stops in optimized visit order. */
  orderedStops: ItineraryWaypoint[];
};

/** Resolves a warehouse/store ID to a waypoint. Throws 404 otherwise. */
export async function resolveWaypointFromId(
  id: ObjectId,
): Promise<ItineraryWaypoint> {
  const warehouse = await warehouses.findOne({ _id: id });
  if (warehouse) {
    return {
      name: warehouse.name,
      address: warehouse.address,
      location: warehouse.location,
      existingStoreId: warehouse._id,
    };
  }
  const store = await stores.findOne({ _id: id });
  if (store) {
    return {
      name: store.name,
      address: store.address,
      location: store.location,
      existingStoreId: store._id,
    };
  }
  throw new HTTPException(404, {
    message: `No warehouse or store found for id ${id}`,
  });
}

function toGoogleWaypoint(wp: ItineraryWaypoint) {
  // Prefer coordinates: works uniformly for both DB-backed points and ad-hoc
  // ones picked from the map, and avoids another geocode round-trip.
  return {
    location: {
      latLng: {
        latitude: wp.location.lat,
        longitude: wp.location.lng,
      },
    },
  };
}

export async function computeItinerary(
  input: ComputeItineraryInput,
): Promise<ComputeItineraryResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

  const { start, stops } = input;

  const res = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.legs.distanceMeters,routes.legs.duration,routes.optimizedIntermediateWaypointIndex",
    },
    body: JSON.stringify({
      origin: toGoogleWaypoint(start),
      destination: toGoogleWaypoint(start),
      intermediates: stops.map(toGoogleWaypoint),
      travelMode: "DRIVE",
      optimizeWaypointOrder: true,
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
      legs: Array<{ distanceMeters: number; duration: string }>;
      optimizedIntermediateWaypointIndex?: number[];
    }>;
  };

  const route = data.routes?.[0];
  if (!route) throw new HTTPException(502, { message: "No route returned by Google" });

  const totalDistanceKilometers =
    route.legs.reduce((sum, leg) => sum + (leg.distanceMeters || 0), 0) / 1000;

  const totalDurationSeconds = route.legs.reduce((sum, leg) => {
    const s = parseInt(leg.duration.replace("s", ""), 10);
    return sum + (isNaN(s) ? 0 : s);
  }, 0);

  const optimizedIndexes = route.optimizedIntermediateWaypointIndex;
  // Google returns -1 when a waypoint index is already optimal (single stop, etc.).
  // Fall back to original order whenever any index is invalid.
  const orderedStops =
    optimizedIndexes &&
    optimizedIndexes.length === stops.length &&
    optimizedIndexes.every((i) => i >= 0 && i < stops.length)
      ? optimizedIndexes.map((i) => stops[i])
      : stops;

  return {
    totalDistanceKilometers,
    totalDurationSeconds,
    orderedStops,
  };
}
