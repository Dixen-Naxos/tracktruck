import type { ObjectId } from "mongodb";
import { db } from "./config.js";
import type { GpsPosition } from "./GpsPosition.js";

export type TruckPositionTrace = {
  _id: ObjectId;
  truckId: ObjectId;
  deliveryId: ObjectId;
  position: GpsPosition;
  timestamp: Date;
};

export const truckPositionTraces = db.collection<TruckPositionTrace>(
  "truckPositionTraces",
);
