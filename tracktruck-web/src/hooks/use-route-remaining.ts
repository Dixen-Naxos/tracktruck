"use client";

import * as React from "react";
import type { LatLng, RouteStop } from "@/lib/trucks-live";

export interface RemainingRoute {
  path: LatLng[];
  distanceMeters: number | null;
  durationSeconds: number | null;
}

interface State {
  status: "idle" | "loading" | "success" | "error";
  data: RemainingRoute | null;
  error: string | null;
}

/**
 * Calls /api/routes to compute the remaining route from `from` through
 * the ordered `stops`. The last stop is the destination, the others are
 * waypoints. Falls back to a straight-line path if the API is not
 * configured (no Google key on the server).
 */
export function useRouteRemaining(
  from: LatLng | null,
  stops: RouteStop[] | null,
): State & { fallback: LatLng[] | null } {
  const [state, setState] = React.useState<State>({
    status: "idle",
    data: null,
    error: null,
  });

  // Build a stable key so the effect only re-fires when inputs really change.
  const key = React.useMemo(() => {
    if (!from || !stops || stops.length === 0) return null;
    return JSON.stringify({ from, stops: stops.map((s) => s.position) });
  }, [from, stops]);

  React.useEffect(() => {
    if (!key || !from || !stops || stops.length === 0) {
      setState({ status: "idle", data: null, error: null });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    const destination = stops[stops.length - 1].position;
    const waypoints = stops.slice(0, -1).map((s) => s.position);

    fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: from, destination, waypoints }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
        setState({
          status: "success",
          data: {
            path: json.path as LatLng[],
            distanceMeters: json.distanceMeters ?? null,
            durationSeconds: json.durationSeconds ?? null,
          },
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          data: null,
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return () => controller.abort();
  }, [key, from, stops]);

  // Naive fallback used while loading or when /api/routes is unavailable:
  // a straight line from the truck through every stop.
  const fallback = React.useMemo<LatLng[] | null>(() => {
    if (!from || !stops || stops.length === 0) return null;
    return [from, ...stops.map((s) => s.position)];
  }, [from, stops]);

  return { ...state, fallback };
}
