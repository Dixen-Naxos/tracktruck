import type { Driver } from "./types";
import { DRIVERS } from "./data";

// ---------------------------------------------------------------------------
// Base request function
// Replace BASE_URL with the real backend origin when available.
// ---------------------------------------------------------------------------

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

async function request<T>(
  method: Method,
  path: string,
  body?: unknown
): Promise<T> {
  // Dev stub: simulate network latency and use in-memory stores.
  // Remove this block and uncomment the fetch below when the backend is ready.
  await _devDelay();
  return _devStub<T>(method, path, body);

  // const res = await fetch(BASE_URL + path, {
  //   method,
  //   headers: { "Content-Type": "application/json" },
  //   body: body !== undefined ? JSON.stringify(body) : undefined,
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  // if (res.status === 204) return undefined as T;
  // return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// ApiDrivers
// ---------------------------------------------------------------------------

export const ApiDrivers = {
  list: () =>
    request<Driver[]>("GET", "/api/drivers"),

  get: (id: string) =>
    request<Driver>("GET", `/api/drivers/${id}`),

  create: (input: Omit<Driver, "id">) =>
    request<Driver>("POST", "/api/drivers", input),

  update: (id: string, patch: Partial<Driver>) =>
    request<Driver>("PATCH", `/api/drivers/${id}`, patch),

  remove: (id: string) =>
    request<void>("DELETE", `/api/drivers/${id}`),
};

// ---------------------------------------------------------------------------
// ApiOrders  (à compléter quand les types Order seront définis)
// ---------------------------------------------------------------------------

// export const ApiOrders = {
//   list: () => request<Order[]>("GET", "/api/orders"),
//   get: (id: string) => request<Order>("GET", `/api/orders/${id}`),
//   create: (input: Omit<Order, "id">) => request<Order>("POST", "/api/orders", input),
//   update: (id: string, patch: Partial<Order>) => request<Order>("PATCH", `/api/orders/${id}`, patch),
//   cancel: (id: string, reason: string) => request<void>("POST", `/api/orders/${id}/cancel`, { reason }),
// };

// ---------------------------------------------------------------------------
// ApiDashcam  (à compléter quand les types VideoRecord seront définis)
// ---------------------------------------------------------------------------

// export const ApiDashcam = {
//   list: (orderId?: string) => request<VideoRecord[]>("GET", `/api/dashcam${orderId ? `?orderId=${orderId}` : ""}`),
//   get: (id: string) => request<VideoRecord>("GET", `/api/dashcam/${id}`),
//   annotate: (id: string, note: string) => request<VideoRecord>("PATCH", `/api/dashcam/${id}/annotation`, { note }),
//   removeAnnotation: (id: string) => request<VideoRecord>("DELETE", `/api/dashcam/${id}/annotation`),
//   setRetentionPolicy: (days: number) => request<void>("PUT", "/api/dashcam/policy", { retentionDays: days }),
// };

// ---------------------------------------------------------------------------
// ApiIncidents  (à compléter quand les types Incident seront définis)
// ---------------------------------------------------------------------------

// export const ApiIncidents = {
//   list: () => request<Incident[]>("GET", "/api/incidents"),
//   get: (id: string) => request<Incident>("GET", `/api/incidents/${id}`),
//   updateStatus: (id: string, status: IncidentStatus, note?: string) =>
//     request<Incident>("PATCH", `/api/incidents/${id}`, { status, note }),
// };

// ---------------------------------------------------------------------------
// Dev stubs — in-memory stores, survives navigation during dev.
// Delete this section entirely when switching to real API calls.
// ---------------------------------------------------------------------------

const _devDelay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

let _driversStore: Driver[] = [...DRIVERS];

function _devStub<T>(method: Method, path: string, body?: unknown): T {
  // Drivers
  if (path === "/api/drivers") {
    if (method === "GET") return [..._driversStore] as T;
    if (method === "POST") {
      const input = body as Omit<Driver, "id">;
      const created: Driver = {
        ...input,
        id: "D-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      };
      _driversStore = [created, ..._driversStore];
      return created as T;
    }
  }

  const driverMatch = path.match(/^\/api\/drivers\/(.+)$/);
  if (driverMatch) {
    const id = driverMatch[1];
    if (method === "GET") {
      const found = _driversStore.find((d) => d.id === id);
      if (!found) throw new Error("Driver not found");
      return found as T;
    }
    if (method === "PATCH") {
      const idx = _driversStore.findIndex((d) => d.id === id);
      if (idx < 0) throw new Error("Driver not found");
      const updated = { ..._driversStore[idx], ...(body as Partial<Driver>) };
      _driversStore[idx] = updated;
      return updated as T;
    }
    if (method === "DELETE") {
      _driversStore = _driversStore.filter((d) => d.id !== id);
      return undefined as T;
    }
  }

  throw new Error(`Dev stub: route not handled — ${method} ${path}`);
}

// Suppress unused variable warning for BASE_URL during dev stub phase.
void BASE_URL;