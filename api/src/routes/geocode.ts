import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { proxyReverseGeocode, proxySearchGeocode } from "../features/geocode/nominatimProxy.js";

const reverseQuerySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1),
});

export const geocodeRoute = new Hono()
  .get(
    "/reverse",
    describeRoute({
      summary: "Reverse geocode a coordinate via Nominatim (proxied)",
      tags: ["Geocode"],
      responses: { 200: { description: "Nominatim reverse geocode result" } },
    }),
    validator("query", reverseQuerySchema),
    async (c) => {
      const { lat, lon } = c.req.valid("query");
      return c.json(await proxyReverseGeocode(lat, lon));
    },
  )
  .get(
    "/search",
    describeRoute({
      summary: "Forward geocode an address via Nominatim (proxied)",
      tags: ["Geocode"],
      responses: { 200: { description: "Nominatim search result" } },
    }),
    validator("query", searchQuerySchema),
    async (c) => {
      const { q } = c.req.valid("query");
      return c.json(await proxySearchGeocode(q));
    },
  );
