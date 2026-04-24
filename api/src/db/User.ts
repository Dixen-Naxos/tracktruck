import type { ObjectId } from "mongodb";
import { db } from "./config.js";

type UserBase = {
  _id: ObjectId;
  firebaseUid: string;
  email: string;
};

export type DriverUser = UserBase & {
  role: "driver";
  firstName: string;
  lastName: string;
  phone: string;
  skills: string[];
  zones: string[];
};

export type AdminUser = UserBase & {
  role: "admin";
};

export type User = DriverUser | AdminUser;

export type UserRole = User["role"];

export const users = db.collection<User>("users");

export async function ensureUserIndexes() {
  await users.createIndex({ firebaseUid: 1 }, { unique: true });
}
