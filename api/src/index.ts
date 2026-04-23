import "dotenv/config";
import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { connect } from "./db/config.js";
import { ensureUserIndexes } from "./db/User.js";
import type { AuthEnv } from "./auth/middleware.js";
import { adminsRoutes } from "./routes/admins.js";
import { videosRoute } from "./routes/videos.js";
import { driversRoute } from "./routes/drivers.js";
import { warehousesRoute } from "./routes/warehouses.js";
import { storesRoute } from "./routes/stores.js";

const app = new Hono<AuthEnv>()
  .get("/", (c) => c.text("Hello Hono!"))
  .route("/admins", adminsRoutes)
  .route("/videos", videosRoute)
  .route("/drivers", driversRoute)
  .route("/warehouses", warehousesRoute)
  .route("/stores", storesRoute);

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

  serve(
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
