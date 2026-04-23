import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { type IntineraryStep } from "../../db/Delivery.js";
import { stores } from "../../db/Store.js";
import { warehouses } from "../../db/Warehouse.js";

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";


export type ComputeItineraryInput = {
  startPointId: ObjectId;
  toVisitIds: ObjectId[];
};

type ComputeItineraryResult = {
  points: { lat: number; lng: number }[];
  totalDistanceKilometers: number;
  totalDurationSeconds: number;
  orderedAddresses: string[];
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
          "routes.legs.startLocation,routes.legs.endLocation,routes.legs.distanceMeters,routes.legs.duration,routes.optimizedIntermediateWaypointIndex",
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
        startLocation: { latLng: { latitude: number; longitude: number } };
        endLocation: { latLng: { latitude: number; longitude: number } };
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

  const points = route.legs.flatMap((leg, index) => {
    const start = {
      lat: leg.startLocation.latLng.latitude,
      lng: leg.startLocation.latLng.longitude,
    };

    const end = {
      lat: leg.endLocation.latLng.latitude,
      lng: leg.endLocation.latLng.longitude,
    };

    return index === 0 ? [start, end] : [end];
  });

  const totalDistanceKilometers = route.legs.reduce(
      (sum, leg) => sum + (leg.distanceMeters || 0),
      0,
  )/1000;

  const totalDurationSeconds = route.legs.reduce((sum, leg) => {
    const seconds = parseInt(leg.duration.replace("s", ""), 10);
    return sum + (isNaN(seconds) ? 0 : seconds);
  }, 0);

  let orderedAddresses = stopAddresses;

  if (route.optimizedIntermediateWaypointIndex) {
    orderedAddresses = route.optimizedIntermediateWaypointIndex.map(
        (i) => stopAddresses[i],
    );
  }

  return {
    points,
    totalDistanceKilometers,
    totalDurationSeconds,
    orderedAddresses,
  };
}
