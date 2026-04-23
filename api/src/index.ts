import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { connect } from "./db/config.js";
import { ensureUserIndexes } from "./db/User.js";
import type { AuthEnv } from "./auth/middleware.js";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { videosRoute } from "./routes/videos.js";
import { driversRoute } from "./routes/drivers.js";
import { deliveriesRoute } from "./routes/deliveries.js";

const app = new Hono<AuthEnv>()
  .use("*", cors())
  .get("/", (c) => c.text("Hello Hono!"))
  .route("/videos", videosRoute)
  .route("/drivers", driversRoute)
  .route("/deliveries", deliveriesRoute);

async function main() {
  await connect();
  await ensureUserIndexes();

  serve(
    {
      fetch: app.fetch,
      port: 3001,
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
