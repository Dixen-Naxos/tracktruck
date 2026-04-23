import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { warehouses } from "../../db/Warehouse.js";

export async function deleteWarehouse(id: ObjectId): Promise<void> {
  const result = await warehouses.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new HTTPException(404, { message: "Warehouse not found" });
  }
}
