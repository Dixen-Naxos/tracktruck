import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { trucks } from "../../db/Truck.js";
import { enrichTruck, type TruckListItem } from "./listTrucks.js";

export async function getTruck(id: ObjectId): Promise<TruckListItem> {
  const truck = await trucks.findOne({ _id: id });
  if (!truck) {
    throw new HTTPException(404, { message: "Truck not found" });
  }
  return enrichTruck(truck);
}
