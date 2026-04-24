"use client";

import * as React from "react";
import {
  ApiDeliveries,
  ApiDrivers,
  ApiTrucks,
  ApiWarehouses,
  type ApiTruck,
  type ApiWarehouse,
  type ApiLatLng,
} from "@/lib/api";
import type { Driver } from "@/lib/types";
import type { LatLng } from "@/lib/trucks-live";

type StopMode = "address" | "coords" | "map";

/** A stop being built in the form. The id is purely UI — ephemeral. */
interface DraftStop {
  id: string;
  mode: StopMode;
  name: string;
  address: string;
  lat: string;
  lng: string;
  /** When true, the stop was captured from a click on the map and its
   *  address was reverse-geocoded (or is being). */
  fromMap?: boolean;
}

export interface NewDeliveryDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Last map click; used to append a new stop from coordinates. */
  mapClickPosition?: LatLng | null;
  mapClickVersion?: number;
  /** Fired when a delivery has been created. Parent reloads the truck list. */
  onCreated?: () => void;
  /** Pending stops are reflected on the map so the user sees their route. */
  onStopsChange?: (stops: Array<{ position: LatLng; name: string }>) => void;
  /** Departure warehouse position — shown on the map while building. */
  onDepartureChange?: (position: LatLng | null) => void;
}

function newDraftStop(): DraftStop {
  return {
    id: `draft-${crypto.randomUUID()}`,
    mode: "address",
    name: "",
    address: "",
    lat: "",
    lng: "",
  };
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const GEO_BASE = process.env.NEXT_PUBLIC_API ?? "http://localhost:3000";

async function reverseGeocode(lat: number, lng: number): Promise<{ name: string; address: string } | null> {
  try {
    const res = await fetch(`${GEO_BASE}/geocode/reverse?lat=${lat}&lon=${lng}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      display_name?: string;
      name?: string;
      address?: { road?: string; house_number?: string };
    };
    const address = data.display_name ?? "";
    const line = [data.address?.house_number, data.address?.road].filter(Boolean).join(" ");
    const name = data.name || line || address.split(",")[0] || "";
    return { name, address };
  } catch {
    return null;
  }
}

async function geocodeAddress(address: string): Promise<ApiLatLng | null> {
  try {
    const res = await fetch(`${GEO_BASE}/geocode/search?q=${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    const arr = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = arr[0];
    if (!first) return null;
    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export function NewDeliveryDrawer({
  open,
  onClose,
  mapClickPosition,
  mapClickVersion,
  onCreated,
  onStopsChange,
  onDepartureChange,
}: NewDeliveryDrawerProps) {
  const [trucks, setTrucks] = React.useState<ApiTruck[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [warehouses, setWarehouses] = React.useState<ApiWarehouse[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [truckId, setTruckId] = React.useState("");
  const [driverId, setDriverId] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [plannedStartAt, setPlannedStartAt] = React.useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60_000)),
  );
  const [stops, setStops] = React.useState<DraftStop[]>([newDraftStop()]);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Load reference data when the drawer opens.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadError(null);
    (async () => {
      try {
        const [t, d, w] = await Promise.all([
          ApiTrucks.list(),
          ApiDrivers.list(),
          ApiWarehouses.list(),
        ]);
        if (cancelled) return;
        setTrucks(t);
        setDrivers(d);
        setWarehouses(w);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Publish departure warehouse position.
  React.useEffect(() => {
    if (!onDepartureChange) return;
    const wh = warehouses.find((w) => w._id === warehouseId);
    onDepartureChange(wh ? [wh.location.lat, wh.location.lng] : null);
  }, [warehouseId, warehouses, onDepartureChange]);

  // Publish usable stops (those with coords) to the map.
  React.useEffect(() => {
    if (!onStopsChange) return;
    const ready = stops
      .map((s) => ({
        position: [Number(s.lat), Number(s.lng)] as LatLng,
        name: s.name || "Nouveau point",
      }))
      .filter((s) => Number.isFinite(s.position[0]) && Number.isFinite(s.position[1]));
    onStopsChange(ready);
  }, [stops, onStopsChange]);

  // Reset on close.
  React.useEffect(() => {
    if (open) return;
    setFormError(null);
    setSubmitting(false);
  }, [open]);

  // Map click -> append a new stop in "map" mode and reverse-geocode.
  React.useEffect(() => {
    if (!open) return;
    if (!mapClickPosition) return;

    const [lat, lng] = mapClickPosition;
    const id = `draft-${crypto.randomUUID()}`;
    const fresh: DraftStop = {
      id,
      mode: "map",
      name: "",
      address: "",
      lat: String(lat),
      lng: String(lng),
      fromMap: true,
    };
    setStops((prev) => [...prev, fresh]);

    void (async () => {
      const rev = await reverseGeocode(lat, lng);
      if (!rev) return;
      setStops((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: s.name || rev.name,
                address: s.address || rev.address,
              }
            : s,
        ),
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapClickVersion]);

  const updateStop = (id: string, patch: Partial<DraftStop>) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeStop = (id: string) => {
    setStops((prev) => {
      const next = prev.filter((s) => s.id !== id);
      return next.length > 0 ? next : [newDraftStop()];
    });
  };

  const addStop = () => {
    setStops((prev) => [...prev, newDraftStop()]);
  };

  const handleGeocode = async (id: string) => {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;
    const addr = stop.address.trim();
    if (!addr) {
      setFormError("Saisis une adresse avant de la géolocaliser.");
      return;
    }
    setFormError(null);
    const pos = await geocodeAddress(addr);
    if (!pos) {
      setFormError("Adresse introuvable.");
      return;
    }
    updateStop(id, {
      lat: String(pos.lat),
      lng: String(pos.lng),
      name: stop.name || addr.split(",")[0] || "Nouveau point",
    });
  };

  const canSubmit =
    !!warehouseId &&
    !!truckId &&
    !!plannedStartAt &&
    stops.some(
      (s) =>
        Number.isFinite(Number(s.lat)) &&
        Number.isFinite(Number(s.lng)) &&
        s.name.trim().length > 0,
    );

  const submit = async () => {
    if (submitting) return;
    setFormError(null);

    const readyStops = stops
      .map((s) => ({
        name: s.name.trim(),
        address: s.address.trim(),
        lat: Number(s.lat),
        lng: Number(s.lng),
      }))
      .filter(
        (s) =>
          s.name.length > 0 &&
          Number.isFinite(s.lat) &&
          Number.isFinite(s.lng),
      );

    if (!warehouseId) {
      setFormError("Choisis un entrepôt de départ.");
      return;
    }
    if (!truckId) {
      setFormError("Choisis un camion.");
      return;
    }
    if (readyStops.length === 0) {
      setFormError("Ajoute au moins une étape avec nom + coordonnées.");
      return;
    }

    try {
      setSubmitting(true);
      await ApiDeliveries.create({
        departureWarehouseId: warehouseId,
        stops: readyStops.map((s) => ({
          name: s.name,
          address: s.address,
          location: { lat: s.lat, lng: s.lng },
        })),
        plannedStartAt: new Date(plannedStartAt).toISOString(),
        truckId,
        driverId: driverId || undefined,
      });

      // Reset & close.
      setStops([newDraftStop()]);
      setTruckId("");
      setDriverId("");
      setWarehouseId("");
      onCreated?.();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside
      className="tt-drawer tt-drawer--split"
      data-open={open || undefined}
      role="dialog"
      aria-label="Nouveau trajet"
    >
      <header className="tt-drawer__head">
        <div className="tt-drawer__title">
          <span className="tt-drawer__plate">Nouveau trajet</span>
        </div>
        <button
          type="button"
          className="tt-drawer__close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      <div className="tt-drawer__driver">
        <div className="tt-drawer__driver-name">Planifier une tournée</div>
        <div className="tt-drawer__driver-meta">
          Entrepôt → étapes → retour entrepôt
        </div>
      </div>

      {loadError ? (
        <div className="tt-drawer__alert">
          Chargement impossible : {loadError}
        </div>
      ) : null}

      <section className="tt-drawer__section">
        <div className="tt-drawer__section-head">
          <h3>Assignation</h3>
        </div>

        <label className="tt-drawer__form" style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>Entrepôt de départ</span>
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="tt-drawer__select"
          >
            <option value="">— Sélectionner —</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>

        <label className="tt-drawer__form" style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>Camion</span>
          <select
            value={truckId}
            onChange={(e) => setTruckId(e.target.value)}
            className="tt-drawer__select"
          >
            <option value="">— Sélectionner —</option>
            {trucks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.plateNumber} · {t.fuelType} · {t.packageCapacity} colis
              </option>
            ))}
          </select>
        </label>

        <label className="tt-drawer__form" style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>Chauffeur (optionnel)</span>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="tt-drawer__select"
          >
            <option value="">— Aucun —</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.firstName} {d.lastName}
              </option>
            ))}
          </select>
        </label>

        <label className="tt-drawer__form" style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>Départ prévu</span>
          <input
            type="datetime-local"
            value={plannedStartAt}
            onChange={(e) => setPlannedStartAt(e.target.value)}
            className="tt-drawer__input"
          />
        </label>
      </section>

      <section className="tt-drawer__section">
        <div className="tt-drawer__section-head">
          <h3>Étapes</h3>
          <div className="tt-drawer__edit-toolbar">
            <button type="button" className="tt-drawer__more" onClick={addStop}>
              + Ajouter une étape
            </button>
          </div>
        </div>

        <div className="tt-drawer__reorder-hint">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="currentColor">
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>
            Astuce : clique sur la carte pour ajouter une étape par coordonnées
            (l&apos;adresse sera devinée).
          </span>
        </div>

        <ol className="tt-drawer__stops" data-editing>
          {stops.map((stop, i) => {
            const lat = Number(stop.lat);
            const lng = Number(stop.lng);
            const ready = Number.isFinite(lat) && Number.isFinite(lng) && stop.name.trim().length > 0;
            return (
              <li
                key={stop.id}
                className="tt-drawer__stop"
                data-editing
                data-current={ready || undefined}
              >
                <div className="tt-drawer__stop-rail">
                  <span className="tt-drawer__stop-bullet">{i + 1}</span>
                </div>
                <div className="tt-drawer__stop-body">
                  <div className="tt-drawer__stop-head">
                    <span className="tt-drawer__stop-name">
                      {stop.name.trim() || `Étape ${i + 1}`}
                    </span>
                    <button
                      type="button"
                      className="tt-drawer__more"
                      data-danger
                      onClick={() => removeStop(stop.id)}
                    >
                      Supprimer
                    </button>
                  </div>

                  <div className="tt-drawer__form-row tt-drawer__form-row--address">
                    <select
                      value={stop.mode}
                      onChange={(e) => updateStop(stop.id, { mode: e.target.value as StopMode })}
                      className="tt-drawer__select"
                    >
                      <option value="address">Par adresse</option>
                      <option value="coords">Par coordonnées</option>
                      <option value="map">Clic carte</option>
                    </select>
                    <input
                      type="text"
                      value={stop.name}
                      onChange={(e) => updateStop(stop.id, { name: e.target.value })}
                      placeholder="Nom (client, magasin…)"
                      className="tt-drawer__input"
                    />
                  </div>

                  {stop.mode === "address" ? (
                    <>
                      <input
                        type="text"
                        value={stop.address}
                        onChange={(e) => updateStop(stop.id, { address: e.target.value })}
                        placeholder="Adresse complète"
                        className="tt-drawer__input"
                      />
                      <div className="tt-drawer__actions">
                        <button
                          type="button"
                          className="tt-drawer__more tt-drawer__more--primary"
                          onClick={() => handleGeocode(stop.id)}
                        >
                          Géolocaliser
                        </button>
                        <span className="tt-drawer__addr-preview">
                          {ready ? `→ ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "↑ Clique pour obtenir les coordonnées"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="tt-drawer__form-row tt-drawer__form-row--coords">
                        <input
                          type="number"
                          value={stop.lat}
                          onChange={(e) => updateStop(stop.id, { lat: e.target.value })}
                          placeholder="Latitude"
                          className="tt-drawer__input"
                        />
                        <input
                          type="number"
                          value={stop.lng}
                          onChange={(e) => updateStop(stop.id, { lng: e.target.value })}
                          placeholder="Longitude"
                          className="tt-drawer__input"
                        />
                      </div>
                      <input
                        type="text"
                        value={stop.address}
                        onChange={(e) => updateStop(stop.id, { address: e.target.value })}
                        placeholder="Adresse (facultative)"
                        className="tt-drawer__input"
                      />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {formError ? (
        <div className="tt-drawer__alert" style={{ margin: "0 16px 12px" }}>
          {formError}
        </div>
      ) : null}

      <footer className="tt-drawer__foot" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="tt-drawer__more" onClick={onClose} disabled={submitting}>
          Annuler
        </button>
        <button
          type="button"
          className="tt-drawer__more tt-drawer__more--primary"
          onClick={submit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? "Création…" : "Créer le trajet"}
        </button>
      </footer>
    </aside>
  );
}
