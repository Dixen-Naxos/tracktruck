import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type DeliveryStatus = "planned" | "started" | "done";

export type StoreArrival = {
  storeId: ObjectId;
  arrivedAt: Date;
};

export type Delivery = {
  _id: ObjectId;
  departureWarehouseId: ObjectId;
  /** Store IDs in optimized visit order */
  storeIds: ObjectId[];
  totalDistanceKm: number;
  totalDurationSeconds: number;
  plannedStartAt: Date;
  actualStartAt?: Date;
  storeArrivals: StoreArrival[];
  status: DeliveryStatus;
  truckId?: ObjectId;
  driverId?: ObjectId;
  /** OSM IDs of road signs that were detected (and potentially rerouted around) */
  roadSignIds: string[];
  /** True if the route was recomputed to avoid blocking signs */
  wasRerouted: boolean;
};

export const deliveries = db.collection<Delivery>("deliveries");
