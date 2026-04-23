import { ObjectId } from "mongodb";
import { stores, type Store } from "../../db/Store.js";

export type CreateStoreInput = {
  name: string;
  address: string;
};

export async function createStore(input: CreateStoreInput): Promise<Store> {
  const store: Store = {
    _id: new ObjectId(),
    name: input.name,
    address: input.address,
  };
  await stores.insertOne(store);
  return store;
}
