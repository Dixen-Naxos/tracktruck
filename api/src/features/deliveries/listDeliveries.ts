import { deliveries, type Delivery } from "../../db/Delivery.js";

export async function listDeliveries(): Promise<Delivery[]> {
  return deliveries.find().toArray();
}
