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

function StopRow({
  stop,
  index,
  done,
  isCurrent,
}: {
  stop: RouteStop;
  index: number;
  done: boolean;
  isCurrent?: boolean;
}) {
  return (
    <li
      className="tt-drawer__stop"
      data-done={done || undefined}
      data-current={isCurrent || undefined}
    >
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
}: Props) {
  const isOverlay = layout === "overlay";

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

  const remaining = useRouteRemaining(
    truck && open ? truck.position : null,
    truck && open ? truck.nextStops : null,
  );

  if (!truck) return null;

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
          <h3>Trajet</h3>
          <ol className="tt-drawer__stops">
            <StopRow stop={truck.origin} index={-1} done />
            {truck.nextStops.map((stop, i) => (
              <StopRow
                key={stop.id}
                stop={stop}
                index={i}
                done={!!stop.completedAt}
                isCurrent={i === 0}
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
