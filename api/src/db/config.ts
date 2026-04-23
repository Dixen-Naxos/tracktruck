import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB ?? "hackathon";

export const client = new MongoClient(uri);
export const db = client.db(dbName);

export async function connect() {
  await client.connect();
  console.log(`Connected to MongoDB at ${uri}/${dbName}`);
}

export async function disconnect() {
  await client.close();
}
