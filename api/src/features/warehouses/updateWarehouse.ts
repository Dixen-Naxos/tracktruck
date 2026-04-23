import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { warehouses, type Warehouse } from "../../db/Warehouse.js";

export type UpdateWarehouseInput = {
  name?: string;
  address?: string;
};

export async function updateWarehouse(
  id: ObjectId,
  input: UpdateWarehouseInput,
): Promise<Warehouse> {
  const warehouse = await warehouses.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { returnDocument: "after" },
  );
  if (!warehouse) {
    throw new HTTPException(404, { message: "Warehouse not found" });
  }
  return warehouse;
}
