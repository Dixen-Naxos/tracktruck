import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { stores, type Store } from "../../db/Store.js";
import { geocodeAddress } from "../../services/geocode.js";

export type UpdateStoreInput = {
  name?: string;
  address?: string;
};

export async function updateStore(
    id: ObjectId,
    input: UpdateStoreInput,
): Promise<Store> {
  const existing = await stores.findOne({ _id: id });

  if (!existing) {
    throw new HTTPException(404, { message: "Store not found" });
  }

  let location = existing.location;

  if (input.address && input.address !== existing.address) {
    // 🔍 check doublon ailleurs
    const duplicate = await stores.findOne({
      address: input.address,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new HTTPException(409, {
        message: "Another store already exists at this address",
      });
    }

    location = await geocodeAddress(input.address);
  }

  const updated = await stores.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...input,
          location,
        },
      },
      { returnDocument: "after" },
  );

  return updated!;
}