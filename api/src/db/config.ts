import { MongoClient } from "mongodb";

const base = process.env.MONGO_URI ?? "mongodb://localhost:27017";
const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASSWORD;
const uri = user && pass
  ? base.replace(/^(mongodb:\/\/)/, `$1${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`)
  : base;
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
