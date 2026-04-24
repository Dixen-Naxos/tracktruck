import { stores, type Store } from "../../db/Store.js";

export async function listStores(): Promise<Store[]> {
  return stores.find().toArray();
}
