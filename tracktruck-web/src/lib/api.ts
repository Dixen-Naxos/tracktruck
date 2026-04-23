import type { Driver } from "./types";
import { DRIVERS } from "./data";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type TokenGetter = () => Promise<string | null>;

let _tokenGetter: TokenGetter | null = null;
export function setTokenGetter(fn: TokenGetter) { _tokenGetter = fn; }

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  await _devDelay();
  return _devStub<T>(method, path, body);

  // const token = _tokenGetter ? await _tokenGetter() : null;
  // const headers: HeadersInit = { "Content-Type": "application/json" };
  // if (token) headers["Authorization"] = `Bearer ${token}`;
  // const res = await fetch(BASE_URL + path, {
  //   method,
  //   headers,
  //   body: body !== undefined ? JSON.stringify(body) : undefined,
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  // if (res.status === 204) return undefined as T;
  // return res.json() as Promise<T>;
}

// ─── ApiDrivers ───────────────────────────────────────────────────────────────

export const ApiDrivers = {
  list:   ()                                 => request<Driver[]>("GET",    "/api/drivers"),
  get:    (id: string)                       => request<Driver> ("GET",    `/api/drivers/${id}`),
  create: (input: Omit<Driver, "id">)        => request<Driver> ("POST",   "/api/drivers", input),
  update: (id: string, patch: Partial<Driver>) => request<Driver>("PATCH", `/api/drivers/${id}`, patch),
  remove: (id: string)                       => request<void>   ("DELETE", `/api/drivers/${id}`),
};

// ─── ApiOrders ────────────────────────────────────────────────────────────────

// export const ApiOrders = {
//   list:   ()                                         => request<Order[]>("GET",  "/api/orders"),
//   get:    (id: string)                               => request<Order> ("GET",  `/api/orders/${id}`),
//   create: (input: Omit<Order, "id">)                 => request<Order> ("POST", "/api/orders", input),
//   update: (id: string, patch: Partial<Order>)        => request<Order> ("PATCH",`/api/orders/${id}`, patch),
//   cancel: (id: string, reason: string)               => request<void>  ("POST", `/api/orders/${id}/cancel`, { reason }),
// };

// ─── ApiDashcam ───────────────────────────────────────────────────────────────

// export const ApiDashcam = {
//   list:              (orderId?: string) => request<VideoRecord[]>("GET",    `/api/dashcam${orderId ? `?orderId=${orderId}` : ""}`),
//   get:               (id: string)       => request<VideoRecord> ("GET",    `/api/dashcam/${id}`),
//   annotate:          (id: string, note: string) => request<VideoRecord>("PATCH", `/api/dashcam/${id}/annotation`, { note }),
//   removeAnnotation:  (id: string)       => request<VideoRecord>("DELETE",  `/api/dashcam/${id}/annotation`),
//   setRetentionPolicy:(days: number)     => request<void>        ("PUT",    "/api/dashcam/policy", { retentionDays: days }),
// };

// ─── ApiIncidents ─────────────────────────────────────────────────────────────

// export const ApiIncidents = {
//   list:         ()                                               => request<Incident[]>("GET",   "/api/incidents"),
//   get:          (id: string)                                     => request<Incident> ("GET",   `/api/incidents/${id}`),
//   updateStatus: (id: string, status: IncidentStatus, note?: string) => request<Incident>("PATCH", `/api/incidents/${id}`, { status, note }),
// };

// ─── Dev stubs ────────────────────────────────────────────────────────────────

const _devDelay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

let _driversStore: Driver[] = [...DRIVERS];

function _devStub<T>(method: Method, path: string, body?: unknown): T {
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

void BASE_URL;