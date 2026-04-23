import type { ObjectId } from "mongodb";
import type { GpsPosition } from "./GpsPosition.js";
import { db } from "./config.js";

type IncidentBase = {
  _id: ObjectId;
  position: GpsPosition;
  timestamp: Date;
  comment?: string;
};

export type DeliveryDelayedIncident = IncidentBase & {
  type: "delivery_delayed";
  expectedDelayMinutes: number;
  deliveryId: ObjectId;
};

export type VehicleBreakdownIncident = IncidentBase & {
  type: "vehicle_breakdown";
  deliveryId: ObjectId;
};

export type ExternalIncident = IncidentBase & {
  type: "external";
};

export type Incident =
  | DeliveryDelayedIncident
  | VehicleBreakdownIncident
  | ExternalIncident;

export const incidents = db.collection<Incident>("incidents");
