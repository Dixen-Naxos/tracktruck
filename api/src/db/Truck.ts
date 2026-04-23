import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type FuelType = "diesel" | "essence" | "electrique" | "hybride" | "gpl";

export type Truck = {
  _id: ObjectId;
  plateNumber: string;
  packageCapacity: number;
  fuelType: FuelType;
  fuelConsumptionL100km: number;
};

export const trucks = db.collection<Truck>("trucks");
