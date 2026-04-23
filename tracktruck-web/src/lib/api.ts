// API client stubs. Replace with real fetch calls; keep the function signatures stable
// so the UI doesn't need to change.

import type { Driver, DashcamVideo } from "./types";
import { DRIVERS } from "./data";

// Simulate network latency so the UI feels real-ish during dev.
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// In-memory store so create/update survive navigation during dev.
// Replace by real API calls.
let store: Driver[] = [...DRIVERS];

export async function listDrivers(): Promise<Driver[]> {
  await delay();
  return [...store];
  // Example real call:
  // const res = await fetch("/api/drivers", { cache: "no-store" });
  // if (!res.ok) throw new Error("Failed to load drivers");
  // return (await res.json()) as Driver[];
}

export async function getDriver(id: string): Promise<Driver | undefined> {
  await delay(100);
  return store.find((d) => d.id === id);
}

export async function createDriver(input: Omit<Driver, "id">): Promise<Driver> {
  await delay();
  const newDriver: Driver = {
    ...input,
    id: "D-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
  };
  store = [newDriver, ...store];
  return newDriver;
}

export async function updateDriver(id: string, patch: Partial<Driver>): Promise<Driver> {
  await delay();
  const idx = store.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error("Driver not found");
  const updated = { ...store[idx], ...patch };
  store[idx] = updated;
  return updated;
}

export async function deleteDriver(id: string): Promise<void> {
  await delay();
  store = store.filter((d) => d.id !== id);
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function listDashcamVideos(): Promise<DashcamVideo[]> {
  const res = await fetch(`${API_BASE}/videos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load videos");
  return res.json() as Promise<DashcamVideo[]>;
}

export async function getDashcamVideoUrl(videoId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/videos/${videoId}/download-url`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to get video URL");
  const { downloadUrl } = await res.json() as { downloadUrl: string };
  return downloadUrl;
}
