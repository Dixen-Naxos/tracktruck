import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type Truck = {
  _id: ObjectId;
  packageCapacity: number;
  plateNumber: string;
};

export const trucks = db.collection<Truck>("trucks");
