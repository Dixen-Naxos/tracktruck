import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { warehouses, type Warehouse } from "../../db/Warehouse.js";

export async function getWarehouse(id: ObjectId): Promise<Warehouse> {
  const warehouse = await warehouses.findOne({ _id: id });
  if (!warehouse) {
    throw new HTTPException(404, { message: "Warehouse not found" });
  }
  return warehouse;
}
