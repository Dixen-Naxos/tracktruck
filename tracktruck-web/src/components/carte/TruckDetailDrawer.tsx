"use client";

import * as React from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type RouteStop,
  type TruckLive,
} from "@/lib/trucks-live";
import { useRouteRemaining } from "@/hooks/use-route-remaining";

interface Props {
  truck: TruckLive | null;
  open: boolean;
  layout?: "overlay" | "split";
  onClose: () => void;
  onAddStop?: (
    truckId: string,
    values: {
      name: string;
      address: string;
      kind: RouteStop["kind"];
      position: [number, number];
    },
  ) => void;
  onEditStop?: (
    truckId: string,
    stopIndex: number,
    values: {
      name: string;
      address: string;
      kind: RouteStop["kind"];
      position: [number, number];
    },
  ) => void;
  onDeleteStop?: (truckId: string, stopIndex: number) => void;
  onReorderStop?: (truckId: string, fromIndex: number, toIndex: number) => void;
  mapClickPosition?: [number, number] | null;
  mapClickVersion?: number;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDistance(m: number | null): string {
  if (m == null) return "—";
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatDuration(s: number | null): string {
  if (s == null) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}

function isStopLocked(stop: RouteStop): boolean {
  return !!stop.completedAt;
}

function splitAddress(address: string): { streetNumber: string; streetName: string } {
  const trimmed = address.trim();
  if (!trimmed) return { streetNumber: "", streetName: "" };

  const match = trimmed.match(/^([0-9]+\s*[a-zA-Z]?\b)\s+(.*)$/);
  if (!match) {
    return { streetNumber: "", streetName: trimmed };
  }

  return {
    streetNumber: match[1].trim(),
    streetName: match[2].trim(),
  };
}

function StopRow({
  stop,
  index,
  done,
  isCurrent,
  editingEnabled,
  canModify,
  canDrag,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  dragActive,
  isDragging,
}: {
  stop: RouteStop;
  index: number;
  done: boolean;
  isCurrent?: boolean;
  editingEnabled?: boolean;
  canModify?: boolean;
  canDrag?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop?: () => void;
  dragActive?: boolean;
  isDragging?: boolean;
}) {
  return (
    <li
      className={`tt-drawer__stop ${dragActive ? "tt-drawer__stop--drag-over" : ""}`}
      data-done={done || undefined}
      data-current={isCurrent || undefined}
      data-editing={editingEnabled || undefined}
      data-dragging={isDragging || undefined}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {editingEnabled && canDrag ? (
        <button
          type="button"
          aria-label="Déplacer l'étape"
          title="Glisser pour réordonner"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="tt-drawer__drag-handle"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden fill="currentColor">
            <circle cx="9" cy="6" r="1.4" />
            <circle cx="15" cy="6" r="1.4" />
            <circle cx="9" cy="12" r="1.4" />
            <circle cx="15" cy="12" r="1.4" />
            <circle cx="9" cy="18" r="1.4" />
            <circle cx="15" cy="18" r="1.4" />
          </svg>
        </button>
      ) : null}
      <div className="tt-drawer__stop-rail">
        <span className="tt-drawer__stop-bullet">{done ? "✓" : index + 1}</span>
      </div>
      <div className="tt-drawer__stop-body">
        <div className="tt-drawer__stop-head">
          <span className="tt-drawer__stop-name">{stop.name}</span>
          <span className="tt-drawer__stop-eta">
            {done ? formatTime(stop.completedAt ?? stop.plannedAt) : formatTime(stop.plannedAt)}
          </span>
        </div>
        <div className="tt-drawer__stop-addr">{stop.address}</div>
        <div className="tt-drawer__stop-kind" data-kind={stop.kind}>
          {KIND_LABEL[stop.kind]}
        </div>
        {editingEnabled ? (
          canModify ? (
            <div className="tt-drawer__stop-actions">
              <button
                type="button"
                className="tt-drawer__more"
                onClick={onEdit}
              >
                Modifier
              </button>
              <button
                type="button"
                className="tt-drawer__more"
                data-danger
                onClick={onDelete}
              >
                Supprimer
              </button>
            </div>
          ) : (
            <div className="tt-drawer__locked-note">
              Etape passee verrouillee
            </div>
          )
        ) : null}
      </div>
    </li>
  );
}

const KIND_LABEL: Record<RouteStop["kind"], string> = {
  warehouse: "Entrepôt",
  pickup: "Enlèvement",
  store: "Magasin",
  delivery: "Livraison",
};

export function TruckDetailDrawer({
  truck,
  open,
  layout = "overlay",
  onClose,
  onAddStop,
  onEditStop,
  onDeleteStop,
  onReorderStop,
  mapClickPosition,
  mapClickVersion,
}: Props) {
  const isOverlay = layout === "overlay";
  const [isEditingStops, setIsEditingStops] = React.useState(false);
  const [editingStopIndex, setEditingStopIndex] = React.useState<number | null>(null);
  const [isAddingStop, setIsAddingStop] = React.useState(false);
  const [formValues, setFormValues] = React.useState({
    name: "",
    streetNumber: "",
    streetName: "",
    kind: "delivery" as RouteStop["kind"],
    lat: "",
    lng: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [dragFromIndex, setDragFromIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Lock body scroll when drawer is open (lightweight; no portal needed).
  React.useEffect(() => {
    if (!open || !isOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isOverlay]);

  // ESC closes
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) return;
    setIsEditingStops(false);
    setEditingStopIndex(null);
    setIsAddingStop(false);
    setDragFromIndex(null);
    setDragOverIndex(null);
  }, [open]);

  React.useEffect(() => {
    setEditingStopIndex(null);
    setIsAddingStop(false);
    setDragFromIndex(null);
    setDragOverIndex(null);
  }, [truck?.id]);

  React.useEffect(() => {
    if (!mapClickPosition) return;

    setIsEditingStops(true);
    setIsAddingStop(true);
    setEditingStopIndex(null);
    setFormValues((prev) => ({
      ...prev,
      lat: String(mapClickPosition[0]),
      lng: String(mapClickPosition[1]),
    }));
  }, [mapClickPosition, mapClickVersion]);

  const remaining = useRouteRemaining(
    truck && open ? truck.position : null,
    truck && open ? truck.nextStops : null,
  );

  if (!truck) return null;

  const resetForm = () => {
    setFormValues({
      name: "",
      streetNumber: "",
      streetName: "",
      kind: "delivery",
      lat: "",
      lng: "",
    });
    setFormError(null);
    setEditingStopIndex(null);
    setIsAddingStop(false);
  };

  const handleDropReorder = (toIndex: number) => {
    if (dragFromIndex === null) return;
    if (dragFromIndex === toIndex) {
      setDragFromIndex(null);
      setDragOverIndex(null);
      return;
    }

    const fromStop = truck.nextStops[dragFromIndex];
    const toStop = truck.nextStops[toIndex];
    if (!fromStop || !toStop || isStopLocked(fromStop) || isStopLocked(toStop)) {
      setDragFromIndex(null);
      setDragOverIndex(null);
      return;
    }

    onReorderStop?.(truck.id, dragFromIndex, toIndex);
    setDragFromIndex(null);
    setDragOverIndex(null);
  };

  const startAddStop = () => {
    setFormValues({
      name: "",
      streetNumber: "",
      streetName: "",
      kind: "delivery",
      lat: String(truck.position[0]),
      lng: String(truck.position[1]),
    });
    setFormError(null);
    setEditingStopIndex(null);
    setIsAddingStop(true);
  };

  const startEditStop = (index: number) => {
    const stop = truck.nextStops[index];
    if (!stop || isStopLocked(stop)) return;
    const parsedAddress = splitAddress(stop.address);

    setFormValues({
      name: stop.name,
      streetNumber: parsedAddress.streetNumber,
      streetName: parsedAddress.streetName,
      kind: stop.kind,
      lat: String(stop.position[0]),
      lng: String(stop.position[1]),
    });
    setFormError(null);
    setEditingStopIndex(index);
    setIsAddingStop(false);
  };

  const submitStopForm = () => {
    const name = formValues.name.trim();
    const streetNumber = formValues.streetNumber.trim();
    const streetName = formValues.streetName.trim();
    const lat = Number(formValues.lat);
    const lng = Number(formValues.lng);
    const address = [streetNumber, streetName].filter(Boolean).join(" ").trim();

    if (!name || !streetNumber || !streetName || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setFormError("Renseigne nom, numero, rue, latitude et longitude.");
      return;
    }

    setFormError(null);

    const payload = {
      name,
      address,
      kind: formValues.kind,
      position: [lat, lng] as [number, number],
    };

    if (isAddingStop) {
      onAddStop?.(truck.id, payload);
      resetForm();
      return;
    }

    if (editingStopIndex !== null) {
      onEditStop?.(truck.id, editingStopIndex, payload);
      resetForm();
    }
  };

  const formVisible = isEditingStops && (isAddingStop || editingStopIndex !== null);

  const statusColor = STATUS_COLORS[truck.status];

  return (
    <>
      {isOverlay ? (
        <div
          className="tt-drawer__scrim"
          data-open={open || undefined}
          onClick={onClose}
          aria-hidden
        />
      ) : null}
      <aside
        className={`tt-drawer ${!isOverlay ? "tt-drawer--split" : ""}`}
        data-open={open || undefined}
        role="dialog"
        aria-label={`Détails du camion ${truck.plate}`}
      >
        <header className="tt-drawer__head">
          <div className="tt-drawer__title">
            <span className="tt-drawer__plate">{truck.plate}</span>
            <span
              className="tt-drawer__status"
              style={{
                color: statusColor,
                background: `color-mix(in oklab, ${statusColor} 14%, transparent)`,
              }}
            >
              {STATUS_LABELS[truck.status]}
            </span>
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
          <div className="tt-drawer__driver-name">{truck.driverName}</div>
          <div className="tt-drawer__driver-meta">{truck.driverId}</div>
        </div>

        <section className="tt-drawer__metrics">
          <div>
            <span>Charge</span>
            <strong>{truck.load}%</strong>
          </div>
          <div>
            <span>Vitesse</span>
            <strong>{truck.speedKmh ? `${truck.speedKmh} km/h` : "—"}</strong>
          </div>
          <div>
            <span>Reste à parcourir</span>
            <strong>{formatDistance(remaining.data?.distanceMeters ?? null)}</strong>
          </div>
          <div>
            <span>Temps restant</span>
            <strong>{formatDuration(remaining.data?.durationSeconds ?? null)}</strong>
          </div>
        </section>

        {remaining.status === "error" ? (
          <div className="tt-drawer__alert">
            Trajet restant indisponible (Google Routes : {remaining.error}). Affichage approximatif.
          </div>
        ) : null}

        <section className="tt-drawer__section">
          <div className="tt-drawer__section-head">
            <h3>Trajet</h3>
            <div className="tt-drawer__edit-toolbar">
              <button
                type="button"
                className="tt-drawer__more"
                onClick={() => setIsEditingStops((v) => !v)}
              >
                {isEditingStops ? "Terminer" : "Modifier les etapes"}
              </button>
              {isEditingStops ? (
                <button
                  type="button"
                  className="tt-drawer__more"
                  onClick={startAddStop}
                >
                  + Ajouter une etape
                </button>
              ) : null}
            </div>
          </div>
          {formVisible ? (
            <div className="tt-drawer__form">
              <div className="tt-drawer__inline-note">
                {isAddingStop ? "Nouvelle etape" : "Modifier l'etape"}
              </div>
              <div className="tt-drawer__inline-note">
                Astuce: selectionne un camion, puis clique sur la carte pour pre-remplir latitude/longitude.
              </div>
              <input
                type="text"
                value={formValues.name}
                onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nom"
                className="tt-drawer__input"
              />
              <div className="tt-drawer__form-row tt-drawer__form-row--address">
                <input
                  type="text"
                  value={formValues.streetNumber}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, streetNumber: e.target.value }))}
                  placeholder="Numero"
                  className="tt-drawer__input"
                />
                <input
                  type="text"
                  value={formValues.streetName}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, streetName: e.target.value }))}
                  placeholder="Nom de rue"
                  className="tt-drawer__input"
                />
              </div>
              <div className="tt-drawer__addr-preview">
                Adresse: {([formValues.streetNumber, formValues.streetName].filter(Boolean).join(" ") || "-")}
              </div>
              <select
                value={formValues.kind}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    kind: e.target.value as RouteStop["kind"],
                  }))
                }
                className="tt-drawer__select"
              >
                <option value="delivery">Livraison</option>
                <option value="store">Magasin</option>
                <option value="pickup">Enlevement</option>
                <option value="warehouse">Entrepot</option>
              </select>
              <div className="tt-drawer__form-row tt-drawer__form-row--coords">
                <input
                  type="number"
                  value={formValues.lat}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, lat: e.target.value }))}
                  placeholder="Latitude"
                  className="tt-drawer__input"
                />
                <input
                  type="number"
                  value={formValues.lng}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, lng: e.target.value }))}
                  placeholder="Longitude"
                  className="tt-drawer__input"
                />
              </div>
              {formError ? (
                <div className="tt-drawer__error">{formError}</div>
              ) : null}
              <div className="tt-drawer__actions">
                <button type="button" className="tt-drawer__more" onClick={submitStopForm}>
                  Enregistrer
                </button>
                <button type="button" className="tt-drawer__more" onClick={resetForm}>
                  Annuler
                </button>
              </div>
            </div>
          ) : null}
          {isEditingStops ? (
            <div className="tt-drawer__inline-note" style={{ marginBottom: 10 }}>
              Tu peux deplacer les etapes en les glissant par la poignee ::: a gauche.
            </div>
          ) : null}
          <ol className="tt-drawer__stops">
            <StopRow stop={truck.origin} index={-1} done />
            {truck.nextStops.map((stop, i) => (
              <StopRow
                key={stop.id}
                stop={stop}
                index={i}
                done={!!stop.completedAt}
                isCurrent={i === 0}
                editingEnabled={isEditingStops}
                canModify={!isStopLocked(stop)}
                canDrag={isEditingStops && !isStopLocked(stop)}
                onEdit={() => startEditStop(i)}
                onDelete={() => onDeleteStop?.(truck.id, i)}
                onDragStart={() => {
                  setDragFromIndex(i);
                  setDragOverIndex(i);
                }}
                onDragOver={(e) => {
                  if (!isEditingStops || isStopLocked(stop) || dragFromIndex === null) return;
                  e.preventDefault();
                  setDragOverIndex(i);
                }}
                onDrop={() => handleDropReorder(i)}
                dragActive={dragOverIndex === i && dragFromIndex !== null && dragFromIndex !== i}
              />
            ))}
          </ol>
        </section>

        <footer className="tt-drawer__foot">
          <a className="tt-drawer__more" href={`/chauffeurs?focus=${truck.driverId}`}>
            Fiche chauffeur
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10 6 6 6-6 6" />
            </svg>
          </a>
        </footer>
      </aside>
    </>
  );
}
