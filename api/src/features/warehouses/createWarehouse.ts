import { ObjectId } from "mongodb";
import { warehouses, type Warehouse } from "../../db/Warehouse.js";
import { geocodeAddress } from "../../services/geocode.js";
import {HTTPException} from "hono/http-exception";

export type CreateWarehouseInput = {
  name: string;
  address: string;
};

export async function createWarehouse(
    input: CreateWarehouseInput,
): Promise<Warehouse> {

  const existing = await warehouses.findOne({
    address: input.address,
  });

  if (existing) {
    throw new HTTPException(409, {
      message: "Warehouse already exists at this address",
    });
  }
  const location = await geocodeAddress(input.address);

  const warehouse: Warehouse = {
    _id: new ObjectId(),
    name: input.name,
    address: input.address,
    location,
  };

  await warehouses.insertOne(warehouse);
  return warehouse;
}