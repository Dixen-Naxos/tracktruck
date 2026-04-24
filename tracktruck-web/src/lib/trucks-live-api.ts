// Adapter between the backend truck response (ApiTruck) and the UI-facing
// TruckLive shape used across the /carte page. Lets the existing UI stay
// unchanged while data comes from the backend rather than the hardcoded
// fixtures in trucks-live.ts.

import { ApiTrucks, type ApiEnrichedDelivery, type ApiTruck } from "./api";
import type {
  LatLng,
  RouteStop,
  StopKind,
  TruckLive,
  TruckLiveStatus,
} from "./trucks-live";

const DEFAULT_POSITION: LatLng = [48.8566, 2.3522]; // Paris center fallback

function buildOriginStop(delivery: ApiEnrichedDelivery | null): RouteStop {
  const wh = delivery?.departureWarehouse;
  if (!wh) {
    return {
      id: "ORIGIN-UNKNOWN",
      kind: "warehouse",
      name: "Point de départ",
      address: "—",
      position: DEFAULT_POSITION,
      plannedAt: delivery?.plannedStartAt ?? new Date().toISOString(),
      completedAt: delivery?.actualStartAt ?? undefined,
    };
  }
  return {
    id: wh._id,
    kind: "warehouse",
    name: wh.name,
    address: wh.address,
    position: [wh.location.lat, wh.location.lng],
    plannedAt: delivery?.plannedStartAt ?? new Date().toISOString(),
    completedAt: delivery?.actualStartAt ?? undefined,
  };
}

function splitStops(delivery: ApiEnrichedDelivery | null): {
  pending: RouteStop[];
  done: RouteStop[];
} {
  if (!delivery) return { pending: [], done: [] };

  const pending: RouteStop[] = [];
  const done: RouteStop[] = [];

  delivery.stops.forEach((s, index) => {
    // Last stop in the visit order is the final delivery; earlier ones
    // are regular stores.
    const kind: StopKind =
      index === delivery.stops.length - 1 ? "delivery" : "store";

    const stop: RouteStop = {
      id: s._id,
      kind,
      name: s.name,
      address: s.address,
      position: [s.location.lat, s.location.lng],
      plannedAt: delivery.plannedStartAt,
      completedAt: s.arrivedAt ?? undefined,
    };

    if (s.arrivedAt) done.push(stop);
    else pending.push(stop);
  });

  return { pending, done };
}

function deriveStatus(
  delivery: ApiEnrichedDelivery | null,
  pendingStopsCount: number,
): TruckLiveStatus {
  if (!delivery) return "arret";
  if (delivery.status === "done") return "arret";
  if (delivery.status === "planned") return "arret";
  // started
  if (pendingStopsCount === 0) return "retour";
  return "en-route";
}

function deriveLoad(delivery: ApiEnrichedDelivery | null): number {
  if (!delivery) return 0;
  const total = delivery.stops.length;
  if (total === 0) return 0;
  const done = delivery.stops.filter((s) => s.arrivedAt).length;
  // The truck empties as it delivers.
  const remainingRatio = (total - done) / total;
  return Math.round(remainingRatio * 100);
}

export function apiTruckToLive(raw: ApiTruck): TruckLive {
  const delivery = raw.currentDelivery;
  const { pending, done } = splitStops(delivery);

  const origin = buildOriginStop(delivery);
  const position: LatLng = raw.currentPosition
    ? [raw.currentPosition.lat, raw.currentPosition.lng]
    : origin.position;

  const traveled: LatLng[] = done.length
    ? [origin.position, ...done.map((s) => s.position), position]
    : [origin.position, position];

  const driverName = raw.driver
    ? `${raw.driver.firstName} ${raw.driver.lastName}`.trim()
    : "Non assigné";

  return {
    id: raw._id,
    plate: raw.plateNumber,
    driverId: raw.driver?._id ?? "",
    driverName,
    status: deriveStatus(delivery, pending.length),
    load: deriveLoad(delivery),
    speedKmh: undefined,
    headingDeg: undefined,
    position,
    traveled,
    nextStops: pending,
    origin,
    updatedAt: raw.currentPosition?.timestamp ?? new Date().toISOString(),
  };
}

export async function fetchTrucksLive(): Promise<TruckLive[]> {
  const raw = await ApiTrucks.list();
  return raw.map(apiTruckToLive);
}

export async function fetchTruckLive(id: string): Promise<TruckLive> {
  const raw = await ApiTrucks.get(id);
  return apiTruckToLive(raw);
}
