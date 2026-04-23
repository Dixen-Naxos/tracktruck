import { ObjectId } from "mongodb";
import { stores, type Store } from "../../db/Store.js";
import { geocodeAddress } from "../../services/geocode.js";
import {HTTPException} from "hono/http-exception";

export type CreateStoreInput = {
  name: string;
  address: string;
};

export async function createStore(input: CreateStoreInput): Promise<Store> {
  // 🔍 check doublon
  const existing = await stores.findOne({
    address: input.address,
  });

  if (existing) {
    throw new HTTPException(409, {
      message: "Store already exists at this address",
    });
  }

  const location = await geocodeAddress(input.address);

  const store: Store = {
    _id: new ObjectId(),
    name: input.name,
    address: input.address,
    location,
  };

  await stores.insertOne(store);
  return store;
}