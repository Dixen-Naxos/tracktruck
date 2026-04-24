import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { stores, type Store } from "../../db/Store.js";

export async function getStore(id: ObjectId): Promise<Store> {
  const store = await stores.findOne({ _id: id });
  if (!store) {
    throw new HTTPException(404, { message: "Store not found" });
  }
  return store;
}
