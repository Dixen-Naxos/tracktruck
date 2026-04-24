# API

Hono + MongoDB + Firebase Auth.

## Authenticating routes

Auth is implemented as Hono middleware in [src/auth/middleware.ts](src/auth/middleware.ts). Clients send a Firebase ID token as `Authorization: Bearer <token>`. The middleware verifies it, loads the matching user from the `users` MongoDB collection, and stores it on the context.

### Typing the app

Any Hono instance (or sub-router) that serves authenticated routes must be parameterized with `AuthEnv` so `c.get("user")` is typed as `User`:

```ts
import { Hono } from "hono";
import type { AuthEnv } from "./auth/middleware.js";

const app = new Hono<AuthEnv>();
```

### Requiring authentication

Mount `requireAuth` on the route (or route group) that needs a logged-in user:

```ts
import { requireAuth } from "./auth/middleware.js";

app.get("/me", requireAuth, (c) => {
  const user = c.get("user"); // User, fully typed
  return c.json(user);
});
```

Apply it to a whole sub-tree with `app.use`:

```ts
const protectedRoutes = new Hono<AuthEnv>();
protectedRoutes.use("*", requireAuth);
protectedRoutes.get("/deliveries", (c) => {
  /* c.get("user") is available */
});
app.route("/api", protectedRoutes);
```

### Requiring a role

`requireRole(...roles)` must run **after** `requireAuth` because it reads `c.get("user")`:

```ts
import { requireAuth, requireRole } from "./auth/middleware.js";

app.get("/admin/fleet", requireAuth, requireRole("admin"), (c) => { ... });
app.post("/deliveries/:id/complete", requireAuth, requireRole("driver"), (c) => { ... });
```

Roles come from the `UserRole` union in [src/db/User.ts](src/db/User.ts) (`"driver" | "admin"`). A `User` is a discriminated union — narrow on `user.role` before accessing driver-only fields like `firstName`:

```ts
const user = c.get("user");
if (user.role === "driver") {
  console.log(user.firstName);
}
```

### Error responses

The middleware throws `HTTPException`; Hono converts these to HTTP responses automatically. Do not catch them in handlers.

- `401 Missing bearer token` — no `Authorization` header or wrong scheme
- `401 Invalid token` — Firebase rejected the ID token
- `403 User not registered` — token valid, but no `users` row with that `firebaseUid`
- `403 Forbidden` — `requireRole` rejected the user's role

## Validating input

Every route that reads a request body, query params, or path params must validate them with zod via `hono-openapi`. Hand-rolled `if (typeof x !== "string")` checks are not allowed — the validator generates 400 responses automatically and gives the handler a fully-typed `c.req.valid(...)`.

```ts
import { validator } from "hono-openapi";
import { z } from "zod";

const createDeliverySchema = z.object({
  warehouseId: z.string(),
  scheduledFor: z.iso.datetime().transform((s) => new Date(s)),
});

app.post(
  "/deliveries",
  requireAuth,
  requireRole("admin"),
  validator("json", createDeliverySchema),
  (c) => {
    const { warehouseId, scheduledFor } = c.req.valid("json");
    // ...
  },
);
```

Validator targets: `"json"`, `"form"`, `"query"`, `"param"`, `"header"`, `"cookie"`. Use one `zValidator(...)` call per target; stack them for handlers that validate more than one. Validators must sit **after** `requireAuth`/`requireRole` in the middleware chain so unauthenticated requests never hit the validator.

For zod (v4) usage: prefer `z.iso.datetime()` for ISO 8601 strings (chain `.transform((s) => new Date(s))` if the handler needs a `Date`), `z.coerce.number()` for numeric query params, and `z.enum([...])` for closed sets. Do not use `z.coerce.date()` — it accepts any string `Date` can parse, which is too lenient.

Keep handlers thin. Route handlers must only: validate input, read `c.get("user")` if needed, call a feature function, and return JSON. Any logic beyond that lives in `src/features/` (see below).

## Project layout

```
src/
├── auth/           Firebase Admin SDK init + Hono auth middleware
├── db/             MongoDB client + collection/schema modules (one file per entity)
├── features/       Business logic, grouped by feature
│   └── <feature-name>/
│       ├── <operation>.ts   one file per operation (e.g. createUpload.ts)
│       └── ...
├── routes/         Hono sub-routers — HTTP layer only
├── storage/        Firebase Storage bucket references
└── index.ts        App entry, mounts routes
```

### Features

Every non-trivial operation lives in `src/features/<feature-name>/<operation>.ts` as an exported async function. Feature directories are kebab-case and usually named after the primary entity (e.g. `dashcam-videos/`, `deliveries/`).

A feature function:

- Takes plain inputs (IDs, validated payload values) — not `Context`, `Request`, or zod schemas. The HTTP layer is responsible for extraction and validation.
- Owns its DB writes, storage calls, external-service calls, and domain invariants.
- Returns the data the route should serialize, or throws. Do not return `Response` objects.
- Is importable and testable without spinning up Hono.

Example: [src/features/dashcam-videos/createUpload.ts](src/features/dashcam-videos/createUpload.ts) exports `createDashcamVideoUpload(driverId, timestamp)`, called by [src/routes/videos.ts](src/routes/videos.ts).

```ts
// src/features/dashcam-videos/createUpload.ts
export async function createDashcamVideoUpload(
  driverId: ObjectId,
  timestamp: Date,
): Promise<DashcamVideoUpload> { ... }

// src/routes/videos.ts
.post("/upload-url", zValidator("json", uploadUrlSchema), async (c) => {
  const { timestamp } = c.req.valid("json");
  const driver = c.get("user");
  return c.json(await createDashcamVideoUpload(driver._id, timestamp));
});
```

Zod schemas stay in the route file (they describe HTTP input, not business rules). Feature-level types that the route returns (e.g. `DashcamVideoUpload`) are exported from the feature module.

## Required env

- `FIREBASE_SERVICE_ACCOUNT` must point to a Firebase service account JSON file.
- `FIREBASE_STORAGE_BUCKET` must be the Cloud Storage bucket name (e.g. `my-project.appspot.com`).

Both are read at startup in [src/auth/firebase.ts](src/auth/firebase.ts); missing either throws.
