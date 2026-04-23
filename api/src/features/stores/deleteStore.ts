import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { stores } from "../../db/Store.js";

export async function deleteStore(id: ObjectId): Promise<void> {
  const result = await stores.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new HTTPException(404, { message: "Store not found" });
  }
}
