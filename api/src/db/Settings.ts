import { db } from "./config.js";

export type Setting = {
  key: string;
  value: unknown;
};

export const settings = db.collection<Setting>("settings");
