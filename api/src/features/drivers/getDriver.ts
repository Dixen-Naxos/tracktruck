import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { users, type DriverUser } from "../../db/User.js";

export async function getDriver(id: ObjectId): Promise<DriverUser> {
  const driver = await users.findOne({ _id: id, role: "driver" });
  if (!driver || driver.role !== "driver") {
    throw new HTTPException(404, { message: "Driver not found" });
  }
  return driver;
}
