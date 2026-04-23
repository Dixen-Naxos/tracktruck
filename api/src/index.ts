import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { connect } from "./db/config.js";
import { ensureUserIndexes } from "./db/User.js";
import type { AuthEnv } from "./auth/middleware.js";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { videosRoute } from "./routes/videos.js";
import { driversRoute } from "./routes/drivers.js";

const app = new Hono<AuthEnv>()
  .get("/", (c) => c.text("Hello Hono!"))
  .route("/videos", videosRoute)
  .route("/drivers", driversRoute);

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
