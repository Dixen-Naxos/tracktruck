"use client";

import * as React from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type TruckLive,
} from "@/lib/trucks-live";

interface Props {
  truck: TruckLive;
  onOpenDetails: (truckId: string) => void;
}

/**
 * Body of the Leaflet `<Popup>` that opens above a truck marker.
 * Shows the headline info and a CTA opening the side drawer.
 */
export function TruckPopup({ truck, onOpenDetails }: Props) {
  const nextStop = truck.nextStops[0];
  const eta = nextStop
    ? new Date(nextStop.plannedAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="tt-popup">
      <div className="tt-popup__head">
        <div className="tt-popup__plate">{truck.plate}</div>
        <span
          className="tt-popup__status"
          style={{
            color: STATUS_COLORS[truck.status],
            background: `color-mix(in oklab, ${STATUS_COLORS[truck.status]} 14%, transparent)`,
          }}
        >
          {STATUS_LABELS[truck.status]}
        </span>
      </div>

      <div className="tt-popup__driver">{truck.driverName}</div>

      <dl className="tt-popup__grid">
        <div>
          <dt>Charge</dt>
          <dd>{truck.load}%</dd>
        </div>
        <div>
          <dt>Vitesse</dt>
          <dd>{truck.speedKmh ? `${truck.speedKmh} km/h` : "—"}</dd>
        </div>
        <div>
          <dt>Prochain arrêt</dt>
          <dd className="tt-popup__nextstop">{nextStop?.name ?? "—"}</dd>
        </div>
        <div>
          <dt>ETA</dt>
          <dd>{eta}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => onOpenDetails(truck.id)}
        className="tt-popup__cta"
      >
        Voir le détail
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
