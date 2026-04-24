import "dotenv/config";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { openAPIRouteHandler } from "hono-openapi";
import { connect } from "./db/config.js";
import { ensureUserIndexes } from "./db/User.js";
import { ensureRoadSignIndexes } from "./db/RoadSign.js";
import type { AuthEnv } from "./auth/middleware.js";
import { adminsRoutes } from "./routes/admins.js";
import { videosRoute } from "./routes/videos.js";
import { driversRoute } from "./routes/drivers.js";
import { driverPositionsRoute } from "./routes/driverPositions.js";
import { driverIncidentsRoute } from "./routes/driverIncidents.js";
import { warehousesRoute } from "./routes/warehouses.js";
import { storesRoute } from "./routes/stores.js";
import { itinerariesRoute } from "./routes/itineraries.js";
import { deliveriesRoute } from "./routes/deliveries.js";
import { roadSignsRoute } from "./routes/roadSigns.js";
import { ordersRoute } from "./routes/orders.js";
import { trucksRoute } from "./routes/trucks.js";
import { seederRoute } from "./routes/seeder.js";
import { startSytadinPolling } from "./features/incidents/fetchIncidents.js";
import { geocodeRoute } from "./routes/geocode.js";
import { cleanupOldVideos } from "./features/dashcam-videos/cleanupVideos.js";
import { schedule } from "node-cron";

const app = new Hono<AuthEnv>()
  .use("*", cors())
  .use("*", logger())
  .get("/", (c) => c.text("Hello Hono!"))
  .route("/admins", adminsRoutes)
  .route("/videos", videosRoute)
  .route("/drivers", driversRoute)
  .route("/drivers", driverPositionsRoute)
  .route("/incidents", driverIncidentsRoute)
  .route("/warehouses", warehousesRoute)
  .route("/stores", storesRoute)
  .route("/itineraries", itinerariesRoute)
  .route("/deliveries", deliveriesRoute)
  .route("/road-signs", roadSignsRoute)
  .route("/orders", ordersRoute)
  .route("/trucks", trucksRoute)
  .route("/geocode", geocodeRoute)
  .route("/seeder", seederRoute);

app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "TrackTruck API",
        version: "1.0.0",
        description: "Fleet tracking API — Hono + MongoDB + Firebase Auth.",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "Firebase ID token",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }),
);

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

async function main() {
  await connect();
  await ensureUserIndexes();
  await ensureRoadSignIndexes();

  startSytadinPolling().catch((error) => {
    console.error("Error starting Sytadin polling:", error);
  });

  // Every day at 03:00
  schedule("0 3 * * *", () => {
    cleanupOldVideos().catch((err) =>
      console.error("[cleanup] Cron error:", err),
    );
  });

  await serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
