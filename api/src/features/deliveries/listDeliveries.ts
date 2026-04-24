import type { ObjectId } from "mongodb";
import { deliveries, type Delivery } from "../../db/Delivery.js";

export async function listDeliveries(filter?: {
  driverId?: ObjectId;
}): Promise<Delivery[]> {
  const query = filter?.driverId ? { driverId: filter.driverId } : {};
  return deliveries.find(query).toArray();
}
