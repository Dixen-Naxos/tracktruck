// API client stubs. Replace with real fetch calls; keep the function signatures stable
// so the UI doesn't need to change.

import type { DashcamVideo, Driver, DriverUser, Incident, IncidentType, Order, Truck, FuelType } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API ?? "";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type TokenGetter = () => Promise<string | null>;

let _tokenGetter: TokenGetter | null = null;
export function setTokenGetter(fn: TokenGetter) {
  _tokenGetter = fn;
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<T> {
  if (path.startsWith("/api/")) {
    await _devDelay();
    return _devStub<T>(method, path, body);
  }

  const token = _tokenGetter ? await _tokenGetter() : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── ApiDrivers ───────────────────────────────────────────────────────────────

type ApiDriver = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string[];
  zones: string[];
};

function toDriver(raw: ApiDriver): Driver {
  const tone =
    (raw.firstName.charCodeAt(0) * 37 + raw.lastName.charCodeAt(0) * 17) % 360;
  return {
    id: raw._id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    phone: raw.phone ?? "—",
    email: raw.email,
    skills: raw.skills ?? [],
    zones: raw.zones ?? [],
    avatarTone: tone,
    initials: (raw.firstName[0] + raw.lastName[0]).toUpperCase(),
  };
}

export const ApiDrivers = {
  list: async () =>
    (await request<ApiDriver[]>("GET", "/drivers")).map(toDriver),
  get: (id: string) => request<Driver>("GET", `/api/drivers/${id}`),
  create: (input: Omit<Driver, "id">) =>
    request<Driver>("POST", "/api/drivers", input),
  createUser: async (input: DriverUser) =>
    toDriver(await request<ApiDriver>("POST", "/drivers", input)),
  update: async (
    id: string,
    patch: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      skills?: string[];
      zones?: string[];
    },
  ) => toDriver(await request<ApiDriver>("PATCH", `/drivers/${id}`, patch)),
  remove: (id: string) => request<void>("DELETE", `/drivers/${id}`),
};

// ─── ApiOrders ────────────────────────────────────────────────────────────────

type ApiOrder = {
  _id: string;
  nom_client: string;
  produit: string;
  quantite: number;
  date_debut_commande: string;
  date_livraison_voulue: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
};

function toOrder(r: ApiOrder): Order {
  return {
    id:                  r._id,
    nomClient:           r.nom_client,
    produit:             r.produit,
    quantite:            r.quantite,
    dateDebutCommande:   r.date_debut_commande,
    dateLivraisonVoulue: r.date_livraison_voulue,
    rue:                 r.rue,
    ville:               r.ville,
    codePostal:          r.code_postal,
    pays:                r.pays,
  };
}

export const ApiOrders = {
  list: async (): Promise<Order[]> => (await request<ApiOrder[]>("GET", "/orders")).map(toOrder),
};

// ─── ApiDashcam ───────────────────────────────────────────────────────────────

// export const ApiDashcam = {
//   list:              (orderId?: string) => request<VideoRecord[]>("GET",    `/api/dashcam${orderId ? `?orderId=${orderId}` : ""}`),
//   get:               (id: string)       => request<VideoRecord> ("GET",    `/api/dashcam/${id}`),
//   annotate:          (id: string, note: string) => request<VideoRecord>("PATCH", `/api/dashcam/${id}/annotation`, { note }),
//   removeAnnotation:  (id: string)       => request<VideoRecord>("DELETE",  `/api/dashcam/${id}/annotation`),
//   setRetentionPolicy:(days: number)     => request<void>        ("PUT",    "/api/dashcam/policy", { retentionDays: days }),
// };

// ─── ApiIncidents ─────────────────────────────────────────────────────────────

type ApiIncident = {
  _id: string;
  type: IncidentType;
  position: { lat: number; lng: number };
  timestamp: string;
  comment?: string;
};

export const ApiIncidents = {
  list: async (): Promise<Incident[]> => {
    const raw = await request<ApiIncident[]>("GET", "/incidents");
    return raw.map((r) => ({ id: r._id, type: r.type, position: r.position, timestamp: r.timestamp, comment: r.comment }));
  },
};

// ─── Dev stubs ────────────────────────────────────────────────────────────────

const _devDelay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

let _driversStore: Driver[] = [];

function _devStub<T>(method: Method, path: string, body?: unknown): T {
  if (path === "/drivers" && method === "POST") {
    const input = body as DriverUser;
    const created: Driver = {
      id: "D-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      skills: input.skills,
      zones: input.zones,
      avatarTone: Math.floor(Math.random() * 360),
      initials: (input.firstName[0] + input.lastName[0]).toUpperCase(),
    };
    _driversStore = [created, ..._driversStore];
    return created as T;
  }

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
// ─── ApiTrucks ────────────────────────────────────────────────────────────────

type ApiTruck = {
  _id: string;
  plateNumber: string;
  packageCapacity: number;
  fuelType: FuelType;
  fuelConsumptionL100km: number | { $numberDecimal: string };
};

function toTruck(r: ApiTruck): Truck {
  return {
    id:                    r._id,
    plateNumber:           r.plateNumber,
    packageCapacity:       r.packageCapacity,
    fuelType:              r.fuelType,
    fuelConsumptionL100km: typeof r.fuelConsumptionL100km === "object"
      ? parseFloat(r.fuelConsumptionL100km.$numberDecimal)
      : r.fuelConsumptionL100km,
  };
}

export const ApiTrucks = {
  list:   async (): Promise<Truck[]> => (await request<ApiTruck[]>("GET", "/trucks")).map(toTruck),
  create: async (input: { plateNumber: string; packageCapacity: number; fuelType: FuelType; fuelConsumptionL100km: number }): Promise<Truck> =>
    toTruck(await request<ApiTruck>("POST", "/trucks", input)),
};

export function listDashcamVideos(
  from?: string,
  to?: string,
): Promise<DashcamVideo[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.size ? `?${params}` : "";
  return request<DashcamVideo[]>("GET", `/videos${query}`);
}

export async function getDashcamVideoUrl(videoId: string): Promise<string> {
  const { downloadUrl } = await request<{ downloadUrl: string }>(
    "GET",
    `/videos/${videoId}/download-url`,
  );
  return downloadUrl;
}

export function retainDashcamVideo(
  videoId: string,
  note: string,
): Promise<unknown> {
  return request("PATCH", `/videos/${videoId}/retain`, { note });
}

export function unretainDashcamVideo(videoId: string): Promise<unknown> {
  return request("DELETE", `/videos/${videoId}/retain`);
}

export function getVideoPolicy(): Promise<{ retentionDays: number }> {
  return request("GET", "/videos/policy");
}

export function setVideoPolicy(
  retentionDays: number,
): Promise<{ retentionDays: number }> {
  return request("PUT", "/videos/policy", { retentionDays });
}
