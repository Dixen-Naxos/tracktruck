import type { ObjectId } from "mongodb";
import { db } from "./config.js";
import type { GpsPosition } from "./GpsPosition.js";

export type DeliveryStatus = "planned" | "started" | "done";

export type StoreArrival = {
  storeId: ObjectId;
  arrivedAt: Date;
};

export type IntineraryStep = {
  start: GpsPosition;
  end: GpsPosition;
};

export type DeliveryStore = {
  storeId: ObjectId;
  packageQuantity: number;
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
  itinerary?: IntineraryStep[];
  truckId?: ObjectId;
  distanceKm?: number;
};

export const deliveries = db.collection<Delivery>("deliveries");
