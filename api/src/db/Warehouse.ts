import type { ObjectId } from "mongodb";
import { db } from "./config.js";
import type {LatLng} from "../services/geocode.js";

export type Warehouse = {
  _id: ObjectId;
  name: string;
  address: string;
  location: LatLng;
};

export const warehouses = db.collection<Warehouse>("warehouses");
