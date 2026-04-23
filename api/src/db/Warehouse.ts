import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type Warehouse = {
  _id: ObjectId;
  name: string;
  address: string;
};

export const warehouses = db.collection<Warehouse>("warehouses");
