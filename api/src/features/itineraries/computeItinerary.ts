import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import type { LatLng } from "../../services/geocode.js";
import { stores } from "../../db/Store.js";
import { warehouses } from "../../db/Warehouse.js";

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

export type ComputeItineraryInput = {
  startPointId: ObjectId;
  toVisitIds: ObjectId[];
};

export type ItineraryStop = {
  id: string;
  name: string;
  address: string;
  location: LatLng;
};

export type ComputeItineraryResult = {
  totalDistanceKilometers: number;
  totalDurationSeconds: number;
  /** Stops in optimized visit order, with name/address/location */
  orderedStops: ItineraryStop[];
  orderedStopIds: ObjectId[];
};

type ResolvedPoint = { address: string; name: string; location: LatLng };

async function resolvePoint(id: ObjectId): Promise<ResolvedPoint> {
  const warehouse = await warehouses.findOne({ _id: id });
  if (warehouse) {
    return { address: warehouse.address, name: warehouse.name, location: warehouse.location };
  }

  const store = await stores.findOne({ _id: id });
  if (store) {
    return { address: store.address, name: store.name, location: store.location };
  }

  throw new HTTPException(404, {
    message: `No warehouse or store found for id ${id}`,
  });
}

export async function computeItinerary(
  input: ComputeItineraryInput,
): Promise<ComputeItineraryResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY is not set");

  const { startPointId, toVisitIds } = input;

  const startPoint = await resolvePoint(startPointId);
  const stopPoints = await Promise.all(toVisitIds.map(resolvePoint));

  const res = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.legs.distanceMeters,routes.legs.duration,routes.optimizedIntermediateWaypointIndex",
    },
    body: JSON.stringify({
      origin: { address: startPoint.address },
      destination: { address: startPoint.address },
      intermediates: stopPoints.map((s) => ({ address: s.address })),
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

  const data = await res.json() as {
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
  const orderedStopPoints = optimizedIndexes
    ? optimizedIndexes.map((i) => stopPoints[i])
    : stopPoints;
  const orderedStopIds = optimizedIndexes
    ? optimizedIndexes.map((i) => toVisitIds[i])
    : toVisitIds;

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
  };
}
