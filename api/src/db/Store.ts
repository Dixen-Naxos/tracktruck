import type { ObjectId } from "mongodb";
import { db } from "./config.js";
import type {LatLng} from "../services/geocode.js";

export type Store = {
  _id: ObjectId;
  name: string;
  address: string;
  location: LatLng;
};

export const stores = db.collection<Store>("stores");
