import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
type IntineraryStep = { start: { lat: number; lng: number }; end: { lat: number; lng: number } };
import { stores } from "../../db/Store.js";
import { warehouses } from "../../db/Warehouse.js";

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";


export type ComputeItineraryInput = {
  startPointId: ObjectId;
  toVisitIds: ObjectId[];
};

export type ComputeItineraryResult = {
  totalDistanceKilometers: number;
  totalDurationSeconds: number;
  orderedAddresses: string[];
  /** toVisitIds reordered to match the optimized visit order */
  orderedStopIds: ObjectId[];
};


/** Looks up an address from either the warehouses or stores collection. */
async function resolveAddress(id: ObjectId): Promise<string> {
  const warehouse = await warehouses.findOne({ _id: id });
  if (warehouse) return warehouse.address;

  const store = await stores.findOne({ _id: id });
  if (store) return store.address;

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

  const startAddress = await resolveAddress(startPointId);
  const stopAddresses = await Promise.all(toVisitIds.map(resolveAddress));

  const res = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
          "routes.legs.distanceMeters,routes.legs.duration,routes.optimizedIntermediateWaypointIndex",
    },
    body: JSON.stringify({
      origin: { address: startAddress },
      destination: { address: startAddress },
      intermediates: stopAddresses.map((address) => ({ address })),
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
      legs: Array<{
        distanceMeters: number;
        duration: string; // ex: "123s"
      }>;
      optimizedIntermediateWaypointIndex?: number[];
    }>;
  };

  const route = data.routes?.[0];
  if (!route) {
    throw new HTTPException(502, {
      message: "No route returned by Google",
    });
  }

  const totalDistanceKilometers = route.legs.reduce(
      (sum, leg) => sum + (leg.distanceMeters || 0),
      0,
  )/1000;

  const totalDurationSeconds = route.legs.reduce((sum, leg) => {
    const seconds = parseInt(leg.duration.replace("s", ""), 10);
    return sum + (isNaN(seconds) ? 0 : seconds);
  }, 0);

  // Apply Google's optimized order if provided, otherwise keep original order
  const optimizedIndexes = route.optimizedIntermediateWaypointIndex;
  const orderedAddresses = optimizedIndexes
    ? optimizedIndexes.map((i) => stopAddresses[i])
    : stopAddresses;
  const orderedStopIds = optimizedIndexes
    ? optimizedIndexes.map((i) => toVisitIds[i])
    : toVisitIds;

  return {
    totalDistanceKilometers,
    totalDurationSeconds,
    orderedAddresses,
    orderedStopIds,
  };
}
