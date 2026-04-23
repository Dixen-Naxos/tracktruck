import L from "leaflet";
import type { StopKind } from "@/lib/trucks-live";

const STOP_GLYPH: Record<StopKind, string> = {
  warehouse: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/></svg>`,
  pickup: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5"/></svg>`,
  store: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18l-1 4H4L3 8Z"/><path d="M5 12v8h14v-8"/></svg>`,
  delivery: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4L19 6"/></svg>`,
};

const STOP_COLOR: Record<StopKind, string> = {
  warehouse: "#0f172a",
  pickup: "#7c3aed",
  store: "#0891b2",
  delivery: "#16a34a",
};

export function buildStopIcon(kind: StopKind, label?: string): L.DivIcon {
  const color = STOP_COLOR[kind];
  const glyph = STOP_GLYPH[kind];
  const safeLabel = label
    ? label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

  const html = `
    <div class="tt-stop">
      <div class="tt-stop__pin" style="background:${color}">${glyph}</div>
      ${safeLabel ? `<div class="tt-stop__label">${safeLabel}</div>` : ""}
    </div>
  `;

  return L.divIcon({
    className: "tt-stop-icon",
    html,
    iconSize: [28, 36],
    iconAnchor: [14, 32],
    popupAnchor: [0, -32],
  });
}

export function buildTruckIcon(opts: {
  plate: string;
  color: string;
  selected?: boolean;
  headingDeg?: number;
}): L.DivIcon {
  const { plate, color, selected, headingDeg } = opts;
  const safePlate = plate
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const rotation =
    typeof headingDeg === "number" ? `transform:rotate(${headingDeg}deg);` : "";

  const html = `
    <div class="tt-truck ${selected ? "tt-truck--selected" : ""}">
      <div class="tt-truck__pin" style="background:${color}">
        <div class="tt-truck__heading" style="${rotation}background:${color}"></div>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 16V6.5h11V16"/>
          <path d="M14 10h4l3 3v3h-7"/>
          <circle cx="7" cy="17.5" r="1.8"/>
          <circle cx="17" cy="17.5" r="1.8"/>
        </svg>
      </div>
      <div class="tt-truck__plate">${safePlate}</div>
    </div>
  `;

  return L.divIcon({
    className: "tt-truck-icon",
    html,
    iconSize: [44, 60],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  });
}
