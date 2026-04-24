import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type OrderStatus = "en-attente" | "planifiée" | "en-cours" | "livrée" | "annulée";

export type Order = {
  _id: ObjectId;
  clientName: string;
  product: string;
  quantity: number;
  startDate: Date;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryDate: Date;
  status: OrderStatus;
};

export const orders = db.collection<Order>("commande");
