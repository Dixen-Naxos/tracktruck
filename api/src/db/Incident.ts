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
  expectedDelayMinutes?: number;
  deliveryId: ObjectId;
};

export type VehicleBreakdownIncident = IncidentBase & {
  type: "vehicle_breakdown";
  deliveryId: ObjectId;
};

export type ExternalIncident = IncidentBase & {
  type: "external";
};

export type AccidentIncident = IncidentBase & {
  type: "accident";
  deliveryId: ObjectId;
};

export type ObstacleIncident = IncidentBase & {
  type: "obstacle";
  deliveryId: ObjectId;
};

export type OtherIncident = IncidentBase & {
  type: "other";
  deliveryId: ObjectId;
};

export type Incident =
  | DeliveryDelayedIncident
  | VehicleBreakdownIncident
  | ExternalIncident
  | AccidentIncident
  | ObstacleIncident
  | OtherIncident;

export const incidents = db.collection<Incident>("incidents");
