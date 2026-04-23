import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type Truck = {
  _id?: ObjectId;
  identifier: string;
};

export const trucks = db.collection<Truck>("trucks");
