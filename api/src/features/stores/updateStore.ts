import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { stores, type Store } from "../../db/Store.js";

export type UpdateStoreInput = {
  name?: string;
  address?: string;
};

export async function updateStore(
  id: ObjectId,
  input: UpdateStoreInput,
): Promise<Store> {
  const store = await stores.findOneAndUpdate(
    { _id: id },
    { $set: input },
    { returnDocument: "after" },
  );
  if (!store) {
    throw new HTTPException(404, { message: "Store not found" });
  }
  return store;
}
