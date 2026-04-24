import { trucks, type Truck } from "../../db/Truck.js";

export async function listTrucks(): Promise<Truck[]> {
  return trucks.find().toArray();
}
