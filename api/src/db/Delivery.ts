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
};

export const deliveries = db.collection<Delivery>("deliveries");
