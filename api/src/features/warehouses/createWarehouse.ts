import { ObjectId } from "mongodb";
import { warehouses, type Warehouse } from "../../db/Warehouse.js";

export type CreateWarehouseInput = {
  name: string;
  address: string;
};

export async function createWarehouse(
  input: CreateWarehouseInput,
): Promise<Warehouse> {
  const warehouse: Warehouse = {
    _id: new ObjectId(),
    name: input.name,
    address: input.address,
  };
  await warehouses.insertOne(warehouse);
  return warehouse;
}
