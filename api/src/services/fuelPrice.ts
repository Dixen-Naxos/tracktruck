import { HTTPException } from "hono/http-exception";
import type { FuelType } from "../db/Truck.js";

const FUELS_API = "https://api.prix-carburants.2aaz.fr";

// Maps internal fuel type to the API's search query string
const FUEL_TYPE_QUERY: Partial<Record<FuelType, string>> = {
  diesel:   "Gazole",
  essence:  "SP95",
  gpl:      "GPLc",
  hybride:  "SP95",
};

type FuelListItem = { id: number; nom: string };
type FuelPriceResponse = { PriceTTC?: { value: number } };

export async function getFuelPricePerLiter(fuelType: FuelType): Promise<number> {
  const query = FUEL_TYPE_QUERY[fuelType];
  if (!query) {
    throw new HTTPException(422, {
      message: `No fuel price available for fuel type "${fuelType}"`,
    });
  }

  const fuelsRes = await fetch(`${FUELS_API}/fuels/?q=${encodeURIComponent(query)}`);
  if (!fuelsRes.ok) {
    throw new HTTPException(502, { message: "Failed to fetch fuel list from prix-carburants API" });
  }

  const fuels = await fuelsRes.json() as FuelListItem[];
  const fuel = fuels[0];
  if (!fuel) {
    throw new HTTPException(502, { message: `No fuel found for query "${query}"` });
  }

  const year = new Date().getFullYear();
  const priceRes = await fetch(`${FUELS_API}/fuel/${fuel.id}/price/2025`);
  if (!priceRes.ok) {
    throw new HTTPException(502, { message: "Failed to fetch fuel price from prix-carburants API" });
  }

  const priceData = await priceRes.json() as FuelPriceResponse;
  const price = priceData?.PriceTTC?.value;
  if (typeof price !== "number") {
    throw new HTTPException(502, { message: "Unexpected fuel price response format" });
  }

  return price;
}
