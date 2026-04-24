import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { trucks, type Truck, type FuelType } from "../../db/Truck.js";

export type CreateTruckInput = {
  plateNumber: string;
  packageCapacity: number;
  fuelType: FuelType;
  fuelConsumptionL100km: number;
};

export async function createTruck(input: CreateTruckInput): Promise<Truck> {
  const existing = await trucks.findOne({ plateNumber: input.plateNumber });
  if (existing) {
    throw new HTTPException(409, { message: "A truck with this plate number already exists" });
  }

  const truck: Truck = { _id: new ObjectId(), ...input };
  await trucks.insertOne(truck);
  return truck;
}
