import { warehouses, type Warehouse } from "../../db/Warehouse.js";

export async function listWarehouses(): Promise<Warehouse[]> {
  return warehouses.find().toArray();
}
