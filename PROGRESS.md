# TrackTruck — Implementation Progress

> Last updated: 2026-04-24
> Reference: [USECASES.md](./USECASES.md)

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ FULL | All acceptance criteria implemented across frontend, backend, and mobile |
| 🟡 PARTIAL | Core skeleton exists but important acceptance criteria are missing |
| ❌ NOT STARTED | No meaningful implementation exists |

---

## Summary

| UC | Title | Status |
|----|-------|--------|
| UC-OP-01 | Driver authentication | 🟡 PARTIAL |
| UC-OP-02 | Itinerary display on map | 🟡 PARTIAL |
| UC-OP-03 | Dashcam recording & upload | 🟡 PARTIAL |
| UC-OP-04 | Receive real-time incident alerts | ❌ NOT STARTED |
| UC-OP-05 | Report an incident | ❌ NOT STARTED |
| UC-SUP-01 | Admin authentication | 🟡 PARTIAL |
| UC-SUP-02 | Live fleet visualization | 🟡 PARTIAL |
| UC-SUP-03 | Road incident alerts on routes | 🟡 PARTIAL |
| UC-SUP-04 | Suggest alternative itinerary / replacement driver | ❌ NOT STARTED |
| UC-SUP-05 | Manually draw a custom itinerary | 🟡 PARTIAL |
| UC-SUP-06 | Estimate route cost | 🟡 PARTIAL |
| UC-SUP-07 | Manage driver profiles & competencies | 🟡 PARTIAL |
| UC-SUP-08 | Validate order & auto-assign driver | 🟡 PARTIAL |
| UC-SUP-09 | Alert when no driver can be assigned | ❌ NOT STARTED |
| UC-SUP-10 | View driver-submitted incident reports | 🟡 PARTIAL |
| UC-SUP-11 | Calendar agenda view for orders | ❌ NOT STARTED |
| UC-SUP-12 | Play back dashcam recordings | 🟡 PARTIAL |
| UC-SUP-13 | Configure automatic video deletion policy | ❌ NOT STARTED |
| UC-SUP-14 | Annotate a video to prevent deletion | ❌ NOT STARTED |

**0 fully implemented · 12 partial · 7 not started**

---

## Module 1 — Opérationnel (Driver)

### UC-OP-01 — Driver Authentication `🟡 PARTIAL`

**Implemented**
- Email/password login + Google SSO in TruckMap (`TruckMap/lib/screens/auth/login_screen.dart`, `TruckMap/lib/services/auth_service.dart`) and TrackCam (identical structure).
- Firebase `onAuthStateChanged` stream drives the auth BLoC, persisting session natively.
- Backend `requireAuth` + `requireRole("driver" | "admin")` enforces role separation at the API layer (`api/src/auth/middleware.ts`).

**Missing**
- `CreateDeliveryScreen` is imported in `TruckMap/lib/screens/auth/auth_gate.dart` but the file does not exist — the app cannot currently compile.
- The `user-not-found` Firebase error is mapped to `"Aucun compte trouvé pour cet email."`, explicitly revealing whether the account exists. Acceptance criteria require a neutral error message.
- The frontend never fetches the user's application role; any authenticated Firebase user (driver or admin) reaches `CreateDeliveryScreen`. Role enforcement exists only at the API layer.
- No configurable inactivity timeout; Firebase's default indefinite refresh is used.
- Web `LoginDialog.tsx` (`tracktruck-web/src/components/LoginDialog.tsx`) implements email/password only — no Google SSO.

---

### UC-OP-02 — Start Service and Display Turn-by-Turn Itinerary `🟡 PARTIAL`

**Implemented**
- `TruckMap/lib/screens/map/map_screen.dart`: Leaflet map with ordered stop markers and route polyline.
- `TruckMap/lib/blocs/itinerary_bloc/itinerary_bloc.dart`: Computes itinerary on start, then re-polls every 30 seconds.
- `api/src/features/itineraries/computeItinerary.ts`: Google Routes API v2 with `optimizeWaypointOrder: true` and `TRAFFIC_AWARE` routing preference.
- `TruckMap/lib/blocs/location_bloc/location_bloc.dart`: Continuous GPS stream (high accuracy, 5 m filter) posted to the API.
- Summary bar in `MapScreen` shows total distance, formatted duration, and stop count.

**Missing**
- No turn-by-turn navigation. The app shows a static polyline; there are no manoeuvre instructions, distance-to-next-turn, or voice guidance.
- Stop types are undifferentiated. `ItineraryStop` has no `type` field (pickup / delivery / break); all stops render as identical numbered blue circles.
- No start-time gate. No scheduled start time is modelled; the itinerary can be requested freely at any time.
- Auth is disabled on the itinerary API endpoint (the `requireAuth` call is commented out in `api/src/routes/itineraries.ts`).

---

### UC-OP-03 — Activate Dashcam (Recording + Offline Buffering) `🟡 PARTIAL`

**Implemented**
- `TrackCam/lib/screens/dashcam/dashcam_screen.dart`: Manual record/stop toggle with animated indicator and elapsed-time display.
- `TrackCam/lib/blocs/camera_bloc/camera_bloc.dart`: Automatic 5-minute segment rotation (`_RotateSegment`).
- `TrackCam/lib/blocs/upload_bloc/upload_bloc.dart`: Detects `connectivity_plus` network changes; cancels in-flight uploads on disconnect; resumes processing on reconnect.
- `TrackCam/lib/services/upload_queue_service.dart`: SQLite-backed upload queue (`upload_queue.db`) with `pending / uploading / completed / failed` states and retry-count tracking — survives app restarts.
- Upload-status badge in `DashcamScreen` (cloud-upload icon when online, cloud-off icon when offline).
- Backend `POST /videos/upload-url` (driver-only) issues a Firebase Storage signed URL; metadata is stored in MongoDB (`api/src/features/dashcam-videos/createUpload.ts`).

**Missing**
- Dashcam does not start automatically when the driver starts service. The spec reads "activation starts automatically with the service OR manually"; only the manual path is implemented.

---

### UC-OP-04 — Receive Real-Time Incident Alerts `❌ NOT STARTED`

**What exists (only backend data collection)**
- `api/src/features/incidents/fetchIncidents.ts`: Polls Sytadin traffic API every 60 seconds, converts Lambert II → WGS-84, and upserts `ExternalIncident` records in MongoDB.

**Entirely missing**
- `firebase_messaging` is not listed in `TruckMap/pubspec.yaml` — no push infrastructure exists in the mobile app.
- No API endpoint or service to push alerts to drivers.
- No route-intersection logic to determine which vehicles are affected by a given incident.
- No incident alert screen, banner, or notification in TruckMap.
- No alternative route proposal flow triggered by an alert.

---

### UC-OP-05 — Report an Incident `❌ NOT STARTED`

**What exists (partial API skeleton only)**
- `api/src/routes/driverIncidents.ts` + `api/src/features/incidents/createIncident.ts`: `POST /incidents` (driver-only) accepts `delivery_delayed` (INC-01) and `vehicle_breakdown` (INC-02) with position and optional comment.

**Entirely missing**
- No incident reporting screen, form, BLoC, repository, or model anywhere in `TruckMap/lib/`.
- INC-03 (urgent maintenance / maintenance impérative) is absent from the API schema.
- No notification sent to the admin after an incident is created.
- No in-app confirmation or acknowledgment flow for the driver.
- `tracktruck-web/src/app/signalements/page.tsx` is a one-liner placeholder: `"Module à déployer"`.

---

## Module 2 — Supervision (Admin)

### UC-SUP-01 — Admin Authentication `🟡 PARTIAL`

**Implemented**
- `tracktruck-web/src/components/LoginDialog.tsx`: Email/password login with Firebase, error mapping, loading state.
- `tracktruck-web/src/context/AuthContext.tsx`: `onAuthStateChanged` listener; `setTokenGetter` injects the Firebase token into all API requests.
- `tracktruck-web/src/components/AppShell.tsx`: App content hidden behind `<LoginDialog>` when unauthenticated.
- `api/src/auth/middleware.ts`: `requireRole("admin")` enforced on every sensitive route.

**Missing**
- Frontend never validates that the authenticated Firebase user has the application role `"admin"`. Any Firebase user can access the supervision UI; only actual API calls are blocked.
- `auth/user-not-found` mapped to a revealing error string (same issue as UC-OP-01).
- No configurable inactivity timeout.
- No Google SSO on the web frontend (available in mobile apps but absent here).

---

### UC-SUP-02 — Live Fleet Visualization `🟡 PARTIAL`

**Implemented**
- `tracktruck-web/src/components/carte/MapClient.tsx`: Full Leaflet map with truck markers (SVG icon + heading arrow), traveled trail polyline, remaining route polyline, stop markers with labels, auto-pan/zoom to selected truck.
- `tracktruck-web/src/app/carte/page.tsx`: Status/search/moving-only filter panel, KPI bar, vehicle list sidebar with ETA and load, `TruckDetailDrawer`.
- `tracktruck-web/src/components/carte/TruckDetailDrawer.tsx`: Driver name, speed, load, remaining distance/time, full stop timeline.

**Missing**
- All truck data is a hardcoded static mock (`TRUCKS_LIVE` constant in `tracktruck-web/src/lib/trucks-live.ts:71`). The frontend never calls `GET /driverPositions`; there are no real-time updates.
- Incidents KPI is hardcoded to `2` (`carte/page.tsx` line ~277: `value={2}`).
- No geographic zone filtering.

---

### UC-SUP-03 — Alerts on Upcoming Road Incidents Affecting Routes `🟡 PARTIAL`

**Implemented**
- `api/src/features/incidents/fetchIncidents.ts` + `api/src/index.ts:71`: Sytadin polling runs at server startup, writing `ExternalIncident` records every 60 seconds.
- `GET /incidents` (admin-only) returns external incidents alongside driver-reported ones.

**Missing**
- No geometry-based logic to match external incidents against active delivery route polylines.
- No alerting mechanism (no WebSocket, SSE, FCM, or email push to admins).
- Frontend shows zero incident data: no alert list, no incident markers on the map, no real-time notification panel.
- No impact estimation (delay, cost surcharge) from matched incidents.

---

### UC-SUP-04 — Suggest and Validate Alternative Itinerary / Replacement Driver `❌ NOT STARTED`

No suggestion engine, no incident-to-route correlation, no replacement driver scoring, no admin validation flow, no delivery history tracing.

---

### UC-SUP-05 — Manually Draw a Custom Itinerary `🟡 PARTIAL`

**Implemented**
- `tracktruck-web/src/components/carte/TruckDetailDrawer.tsx` (lines 590–654): Stop add/edit/delete/reorder form with drag-and-drop.
- Map-click passes coordinates to the drawer via `mapClickPosition` prop (`carte/page.tsx`).
- `MapClient.tsx` `MapClickHandler` fires `onMapClick` on any map click.
- Nominatim reverse-geocode auto-fills street name/number on map click (drawer lines 402–450).

**Missing**
- All stop changes are in React local state only — no API call persists edits to the backend.
- No route recalculation after adding/editing stops; the polyline and duration/distance metrics remain from the original delivery.
- No "Validate and push to driver" action.

---

### UC-SUP-06 — Estimate Route Cost (Fuel, Tolls, Traffic Events) `🟡 PARTIAL`

**Implemented**
- `api/src/features/deliveries/getFuelConsumption.ts`: Computes litres consumed from `truck.fuelConsumptionL100km` × `delivery.totalDistanceKm`.
- `api/src/features/deliveries/getTripCost.ts`: Queries the live French government fuel-price API to compute EUR cost per delivery. Handles diesel, SP95, GPL, hybrid.
- Both accessible at `GET /deliveries/:id/fuel-consumption` and `GET /deliveries/:id/trip-cost` (admin-only).

**Missing**
- No toll cost calculation (no toll API, no road toll database).
- No traffic event or weather surcharge.
- No frontend UI; `tracktruck-web/src/lib/api.ts` has no cost-related functions; `commandes/page.tsx` is a placeholder.
- Cost calculation requires the delivery to exist with a truck assigned; no on-demand pre-creation estimate.

---

### UC-SUP-07 — Manage Driver Profiles & Competencies `🟡 PARTIAL`

**Implemented**
- `tracktruck-web/src/app/chauffeurs/page.tsx`: Grid/list views, search, status/skill filters, sort, KPI bar, `CreateDrawer`, `DriverModal`.
- `tracktruck-web/src/components/chauffeurs/DriverModal.tsx` (four tabs): contact info, competencies, availability grid, mission history.
- `api/src/routes/drivers.ts` + full CRUD feature functions: `POST /drivers`, `GET /drivers`, `GET /drivers/:id`, `PATCH /drivers/:id`, `DELETE /drivers/:id`, all requiring `role: "admin"`.

**Missing**
- `toDriver()` in `tracktruck-web/src/lib/api.ts` hardcodes `license: ""`, `expiry: ""`, `recent: []`, and a fixed `availability` object — these fields do not exist on the backend `DriverUser` model, so license, history, and availability are always empty.
- No backend API for leave/absence records or mission history per driver.
- Driver skills on the backend are a bare `string[]`; skill descriptions and family groupings come from a static local `SKILLS` constant in `data.ts` only.
- `DriverModal` is read-only (no save button wired to PATCH endpoint).

---

### UC-SUP-08 — Validate an Order & Auto-Assign Best Available Driver `🟡 PARTIAL`

**Implemented**
- `api/src/features/deliveries/createDelivery.ts` + `POST /deliveries`: Creates a delivery, runs Google Routes optimisation with road-sign avoidance (height/weight/width via Overpass API), and persists distance and duration.
- `api/src/routes/deliveries.ts` `PUT /deliveries/:id/driver`: Manual assignment of any driver to a delivery.

**Missing**
- No auto-assignment algorithm; driver selection is entirely manual.
- No skill matching between delivery requirements and driver competencies.
- No driver availability or leave check at assignment time.
- Frontend `tracktruck-web/src/app/commandes/page.tsx` is a placeholder: `"Module à déployer"`. No order creation form or assignment UI exists.

---

### UC-SUP-09 — Alert When No Driver Can Be Assigned to an Order `❌ NOT STARTED`

No unassigned-delivery detection logic, no notification mechanism (in-app, push, or email), and no alert UI. The delivery status model (`planned | started | done`) has no "unassigned" or "pending assignment" state.

---

### UC-SUP-10 — View Driver-Submitted Incident Reports `🟡 PARTIAL`

**Implemented**
- `api/src/db/Incident.ts`: Models for `delivery_delayed`, `vehicle_breakdown`, and `external` types, all with GPS position, timestamp, optional comment.
- `api/src/features/incidents/listIncidents.ts` + `GET /incidents` (admin-only): Lists all incidents; accepts `deliveryId` query filter.
- `POST /incidents` (driver-only) via `api/src/routes/driverIncidents.ts`.

**Missing**
- No `status` field on the `Incident` model (`non traité / en cours / résolu`). No PATCH endpoint to update status or add follow-up notes.
- No filtering by status, type, or driver in the backend (only `deliveryId` is supported).
- Frontend `tracktruck-web/src/app/signalements/page.tsx` is a placeholder: `"Module à déployer"`.
- No admin notification when a new incident is created.

---

### UC-SUP-11 — Visualize Orders in a Calendar Agenda View `❌ NOT STARTED`

`tracktruck-web/src/app/commandes/page.tsx` is an explicit placeholder. No calendar or agenda component exists in the codebase. Delivery data (`plannedStartAt`, `status`, `driverId`) is available in the backend but never consumed by a calendar view.

---

### UC-SUP-12 — Play Back Dashcam Recordings per Delivery `🟡 PARTIAL`

**Implemented**
- `tracktruck-web/src/app/dashcam/page.tsx`: Lists dashcam videos with search (driver name, truck ID) and date range filters; fetches signed GCS URL on click and plays via native `<video controls autoPlay>`.
- `api/src/features/dashcam-videos/listVideos.ts`: MongoDB aggregation with date range filter and driver join. Returns driver name, truck ID, delivery ID, timestamp.
- `api/src/features/dashcam-videos/getDownloadUrl.ts`: 1-hour signed GCS download URL (admin-only).
- `tracktruck-web/src/lib/api.ts`: `listDashcamVideos()` and `getDashcamVideoUrl()` call the real backend.

**Missing**
- No access log (who viewed which video and when). Acceptance criteria require a journal d'accès.
- No delivery-to-video navigation. `DashcamVideo.deliveryId` exists in the DB model but no filter, link, or cross-reference by delivery is exposed in the frontend.
- No timestamp/chapter navigation; player is a plain `<video controls>` with no seek-to-event feature.
- No fine-grained role check; spec requires the "responsable qualité" role, which does not exist (only `admin`).

---

### UC-SUP-13 — Configure Automatic Video Deletion Policy `❌ NOT STARTED`

`api/src/db/DashcamVideo.ts` has no `retentionDays`, `expiresAt`, or `policy` field. No scheduled job or background task for automatic deletion exists. No settings page or configuration API endpoint.

---

### UC-SUP-14 — Annotate a Video to Protect it from Auto-Deletion `❌ NOT STARTED`

`DashcamVideo` has no `annotation`, `annotatedBy`, `annotatedAt`, or `protected` flag. No PATCH endpoint to add or remove video annotations. No annotation UI in the dashcam page. Depends on UC-SUP-13, which is also not started.

---

## Cross-Cutting Business Rules

| Rule | Description | Status |
|------|-------------|--------|
| RMT-01 | All critical actions fully audited (author + timestamp) | ❌ No audit trail implemented anywhere |
| RMT-02 | Driver role: operational only; Admin: both modules | 🟡 Enforced at the API level; frontend never validates role after login |
| RMT-03 | GPS and video data encrypted in transit (TLS) and at rest | 🟡 TLS handled by infrastructure; at-rest encryption relies on GCS default; not explicitly documented |
| RMT-04 | Critical notifications delivered within 30 seconds | ❌ No notification infrastructure implemented |
| RMT-05 | Offline GPS and reports sync on reconnection | 🟡 Upload queue syncs on reconnect (TrackCam); GPS offline sync not implemented in TruckMap |
