import type { ObjectId } from "mongodb";

export type Driver = {
  _id: ObjectId;
  lastName: string;
  firstName: string;
};
