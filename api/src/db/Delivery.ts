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

export type Delivery = {
  _id: ObjectId;
  departureWarehouseId: ObjectId;
  storeIds: ObjectId[];
  plannedStartAt: Date;
  actualStartAt?: Date;
  storeArrivals: StoreArrival[];
  status: DeliveryStatus;
  itinerary?: IntineraryStep[];
};

export const deliveries = db.collection<Delivery>("deliveries");
