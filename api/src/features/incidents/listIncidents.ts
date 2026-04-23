import type { Filter, ObjectId } from "mongodb";
import { incidents, type Incident } from "../../db/Incident.js";

export type ListIncidentsInput = {
  deliveryId?: ObjectId;
};

export async function listIncidents(input: ListIncidentsInput) {
  const filter: Filter<Incident> = {};

  if (input.deliveryId) {
    filter.deliveryId = input.deliveryId;
  }

  return await incidents.find(filter).toArray();
}
