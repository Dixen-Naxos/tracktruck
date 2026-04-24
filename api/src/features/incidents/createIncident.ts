import { ObjectId } from "mongodb";
import { incidents, type Incident } from "../../db/Incident.js";
import type { GpsPosition } from "../../db/GpsPosition.js";
import type { DistributiveOmit } from "../../utils/types.js";

export type CreateIncidentInput = DistributiveOmit<
  Incident,
  "_id" | "timestamp"
>;

export async function createIncident(
  driverId: ObjectId,
  input: CreateIncidentInput,
): Promise<Incident> {
  const incident: Incident = {
    _id: new ObjectId(),
    timestamp: new Date(),
    ...input,
  };

  await incidents.insertOne(incident);
  return incident;
}
