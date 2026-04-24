import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { users, type User, type UserRole } from "../db/User.js";
import { firebaseAuth } from "./firebase.js";

export type AuthEnv = {
  Variables: {
    user: User;
  };
};

export const requireAuth: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing bearer token" });
  }
  const token = header.slice("Bearer ".length);

  let decoded;
  try {
    decoded = await firebaseAuth.verifyIdToken(token);
  } catch {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  const user = await users.findOne({ firebaseUid: decoded.uid });
  if (!user) {
    throw new HTTPException(403, { message: "User not registered" });
  }

  c.set("user", user);
  await next();
};

export const requireRole =
  (...roles: UserRole[]): MiddlewareHandler<AuthEnv> =>
  async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      throw new HTTPException(403, { message: "Forbidden" });
    }
    await next();
  };
