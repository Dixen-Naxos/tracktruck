import { users, type DriverUser } from "../../db/User.js";

export async function listDrivers(): Promise<DriverUser[]> {
  return users.find({ role: "driver" }).toArray() as Promise<DriverUser[]>;
}
