import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type Store = {
  _id: ObjectId;
  name: string;
  address: string;
};

export const stores = db.collection<Store>("stores");
