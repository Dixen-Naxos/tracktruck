import { orders, type Order } from "../../db/Order.js";

export async function listOrders(): Promise<Order[]> {
  return orders.find().toArray();
}