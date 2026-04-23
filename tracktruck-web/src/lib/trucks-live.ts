// Live truck data shown on /carte. The API is a mock for now — the same
// shape will be served by the back-end later, so the UI doesn't change.

import { DRIVERS, VEHICLES } from "./data";

export type LatLng = [number, number];

export type StopKind = "warehouse" | "pickup" | "store" | "delivery";

export interface RouteStop {
  id: string;
  kind: StopKind;
  name: string;
  address: string;
  position: LatLng;
  /** Planned arrival, ISO string. */
  plannedAt: string;
  /** Set once the truck has completed this stop. */
  completedAt?: string;
}

export type TruckLiveStatus = "en-route" | "livraison" | "retour" | "arret";

export interface TruckLive {
  id: string;
  plate: string;
  driverId: string;
  driverName: string;
  status: TruckLiveStatus;
  /** Cargo fill ratio 0..100 */
  load: number;
  /** Speed in km/h, undefined when stopped. */
  speedKmh?: number;
  /** Heading in degrees (0 = north, clockwise). */
  headingDeg?: number;
  /** Current GPS position. */
  position: LatLng;
  /** Polyline of where the truck has already been. */
  traveled: LatLng[];
  /** Remaining stops, in order. The first one is the next destination. */
  nextStops: RouteStop[];
  /** Origin warehouse this run started from. */
  origin: RouteStop;
  /** ISO timestamp of the last position update. */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Mock fixtures — Paris area, lat/lng tuples
// ---------------------------------------------------------------------------

const RUNGIS: LatLng = [48.7589, 2.3537];
const GENNEVILLIERS: LatLng = [48.9337, 2.3097];
const NEUILLY: LatLng = [48.8846, 2.2691];
const BOULOGNE: LatLng = [48.8351, 2.2412];
const A6_KM12: LatLng = [48.6889, 2.3856];

function nameFor(driverId: string): string {
  const d = DRIVERS.find((x) => x.id === driverId);
  return d ? `${d.firstName} ${d.lastName}` : driverId;
}

function plateFor(vehicleId: string): string {
  // Make up plates from the vehicle id so they look real.
  const num = vehicleId.replace(/\D/g, "").padStart(3, "0");
  return `AA-${num}-TT`;
}

const NOW = "2026-04-23T13:30:00.000Z";

export const TRUCKS_LIVE: TruckLive[] = [
  // V-01 — Jean Dupont — Rungis → Paris 15e, currently near Porte d'Italie
  {
    id: VEHICLES[0].id,
    plate: plateFor(VEHICLES[0].id),
    driverId: VEHICLES[0].driverId,
    driverName: nameFor(VEHICLES[0].driverId),
    status: "en-route",
    load: 82,
    speedKmh: 38,
    headingDeg: 320,
    position: [48.8175, 2.3592],
    traveled: [
      RUNGIS,
      [48.7702, 2.3635],
      [48.7842, 2.3621],
      [48.7986, 2.3613],
      [48.8108, 2.3604],
      [48.8175, 2.3592],
    ],
    origin: {
      id: "WH-RUNGIS",
      kind: "warehouse",
      name: "Entrepôt Rungis",
      address: "1 rue de la Tour, 94150 Rungis",
      position: RUNGIS,
      plannedAt: "2026-04-23T13:00:00.000Z",
      completedAt: "2026-04-23T13:05:00.000Z",
    },
    nextStops: [
      {
        id: "ST-P15-A",
        kind: "store",
        name: "Carrefour Convention",
        address: "60 rue de la Convention, 75015 Paris",
        position: [48.8408, 2.295],
        plannedAt: "2026-04-23T14:30:00.000Z",
      },
      {
        id: "ST-P15-B",
        kind: "delivery",
        name: "Monoprix Vaugirard",
        address: "215 rue de Vaugirard, 75015 Paris",
        position: [48.8413, 2.3024],
        plannedAt: "2026-04-23T15:10:00.000Z",
      },
    ],
    updatedAt: NOW,
  },

  // V-02 — Marie Martin — Gennevilliers → Versailles, en livraison
  {
    id: VEHICLES[1].id,
    plate: plateFor(VEHICLES[1].id),
    driverId: VEHICLES[1].driverId,
    driverName: nameFor(VEHICLES[1].driverId),
    status: "livraison",
    load: 60,
    speedKmh: 0,
    headingDeg: 200,
    position: [48.8014, 2.1301],
    traveled: [
      GENNEVILLIERS,
      [48.9105, 2.2791],
      [48.886, 2.2517],
      [48.8625, 2.2126],
      [48.8323, 2.1731],
      [48.8014, 2.1301],
    ],
    origin: {
      id: "WH-GEN",
      kind: "warehouse",
      name: "Plateforme Gennevilliers",
      address: "Avenue des Grésillons, 92230 Gennevilliers",
      position: GENNEVILLIERS,
      plannedAt: "2026-04-23T12:30:00.000Z",
      completedAt: "2026-04-23T12:35:00.000Z",
    },
    nextStops: [
      {
        id: "ST-VRS-A",
        kind: "delivery",
        name: "Château de Versailles — Logistique",
        address: "Place d'Armes, 78000 Versailles",
        position: [48.8049, 2.1204],
        plannedAt: "2026-04-23T15:00:00.000Z",
      },
    ],
    updatedAt: NOW,
  },

  // V-03 — Pierre Bernard — retour vers Rungis depuis Boulogne
  {
    id: VEHICLES[2].id,
    plate: plateFor(VEHICLES[2].id),
    driverId: VEHICLES[2].driverId,
    driverName: nameFor(VEHICLES[2].driverId),
    status: "retour",
    load: 18,
    speedKmh: 52,
    headingDeg: 145,
    position: [48.8201, 2.2921],
    traveled: [
      BOULOGNE,
      [48.836, 2.2531],
      [48.8265, 2.2724],
      [48.8201, 2.2921],
    ],
    origin: {
      id: "ST-BLG",
      kind: "store",
      name: "Magasin Boulogne",
      address: "12 avenue du Général Leclerc, 92100 Boulogne-Billancourt",
      position: BOULOGNE,
      plannedAt: "2026-04-23T13:15:00.000Z",
      completedAt: "2026-04-23T13:20:00.000Z",
    },
    nextStops: [
      {
        id: "WH-RUNGIS-RET",
        kind: "warehouse",
        name: "Entrepôt Rungis (retour)",
        address: "1 rue de la Tour, 94150 Rungis",
        position: RUNGIS,
        plannedAt: "2026-04-23T16:15:00.000Z",
      },
    ],
    updatedAt: NOW,
  },

  // V-04 — Sophie Laurent — Neuilly → Orly, vient de partir
  {
    id: VEHICLES[3].id,
    plate: plateFor(VEHICLES[3].id),
    driverId: VEHICLES[3].driverId,
    driverName: nameFor(VEHICLES[3].driverId),
    status: "en-route",
    load: 74,
    speedKmh: 44,
    headingDeg: 165,
    position: [48.8689, 2.275],
    traveled: [NEUILLY, [48.8746, 2.272], [48.8689, 2.275]],
    origin: {
      id: "WH-NEU",
      kind: "warehouse",
      name: "Hub Neuilly",
      address: "120 avenue Charles-de-Gaulle, 92200 Neuilly-sur-Seine",
      position: NEUILLY,
      plannedAt: "2026-04-23T13:25:00.000Z",
      completedAt: "2026-04-23T13:30:00.000Z",
    },
    nextStops: [
      {
        id: "ST-ORLY-A",
        kind: "delivery",
        name: "Aéroport Paris-Orly · Cargo",
        address: "Aérogare Sud, 94390 Orly",
        position: [48.7233, 2.3795],
        plannedAt: "2026-04-23T15:45:00.000Z",
      },
    ],
    updatedAt: NOW,
  },

  // V-05 — Karim Benali — arrêt sur l'A6 (PRA)
  {
    id: VEHICLES[4].id,
    plate: plateFor(VEHICLES[4].id),
    driverId: VEHICLES[4].driverId,
    driverName: nameFor(VEHICLES[4].driverId),
    status: "arret",
    load: 45,
    speedKmh: 0,
    headingDeg: 180,
    position: A6_KM12,
    traveled: [
      [48.8566, 2.3522],
      [48.8125, 2.3601],
      [48.7589, 2.3537],
      A6_KM12,
    ],
    origin: {
      id: "WH-PARIS",
      kind: "warehouse",
      name: "Hub Paris Centre",
      address: "rue de Rivoli, 75001 Paris",
      position: [48.8566, 2.3522],
      plannedAt: "2026-04-23T11:00:00.000Z",
      completedAt: "2026-04-23T11:10:00.000Z",
    },
    nextStops: [
      {
        id: "ST-LYN",
        kind: "delivery",
        name: "Plateforme Lyon Nord",
        address: "12 boulevard Stalingrad, 69100 Villeurbanne",
        position: [45.7773, 4.882],
        plannedAt: "2026-04-23T19:30:00.000Z",
      },
    ],
    updatedAt: NOW,
  },
];

export function findTruck(id: string): TruckLive | undefined {
  return TRUCKS_LIVE.find((t) => t.id === id);
}

export const STATUS_LABELS: Record<TruckLiveStatus, string> = {
  "en-route": "En route",
  livraison: "En livraison",
  retour: "Retour à vide",
  arret: "Arrêté",
};

export const STATUS_COLORS: Record<TruckLiveStatus, string> = {
  "en-route": "var(--accent)",
  livraison: "var(--success)",
  retour: "var(--ink-3)",
  arret: "var(--warn)",
};
