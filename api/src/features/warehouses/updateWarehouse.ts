import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { warehouses, type Warehouse } from "../../db/Warehouse.js";
import { geocodeAddress } from "../../services/geocode.js";

export type UpdateWarehouseInput = {
  name?: string;
  address?: string;
};

export async function updateWarehouse(
    id: ObjectId,
    input: UpdateWarehouseInput,
): Promise<Warehouse> {
  const existing = await warehouses.findOne({ _id: id });

  if (!existing) {
    throw new HTTPException(404, { message: "Warehouse not found" });
  }

  let location = existing.location;

  if (input.address && input.address !== existing.address) {
    const duplicate = await warehouses.findOne({
      address: input.address,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new HTTPException(409, {
        message: "Another warehouse already exists at this address",
      });
    }
    location = await geocodeAddress(input.address);
  }

  const updated = await warehouses.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...input,
          location,
        },
      },
      { returnDocument: "after" },
  );

  if (!updated) {
    throw new HTTPException(500, { message: "Update failed" });
  }

  return updated;
}