"use client";

import * as React from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  STATUS_COLORS,
  TRUCKS_LIVE,
  type LatLng,
  type TruckLive,
} from "@/lib/trucks-live";
import { useRouteRemaining } from "@/hooks/use-route-remaining";

import { buildStopIcon, buildTruckIcon } from "./icons";
import { TruckPopup } from "./TruckPopup";

const PARIS_CENTER: LatLng = [48.8566, 2.3522];

interface Props {
  trucks?: TruckLive[];
  detailFocus?: boolean;
  selectedTruckId: string | null;
  onSelectTruck: (id: string | null) => void;
  onOpenDetails: (id: string) => void;
  onMapClick?: (position: LatLng) => void;
  /** Preview points for a delivery currently being built. */
  pendingStops?: Array<{ position: LatLng; name: string }> | null;
  /** Departure warehouse for the delivery being built. */
  pendingOrigin?: LatLng | null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (position: LatLng) => void }) {
  useMapEvents({
    click: (event) => {
      onMapClick?.([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function InvalidateMapSize({ trigger }: { trigger: string }) {
  const map = useMap();

  React.useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      map.invalidateSize({ pan: false, animate: false });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [map, trigger]);

  return null;
}

/**
 * Pans/zooms the map to fit the selected truck's full journey
 * (origin + traveled trail + remaining stops). Doesn't fight the user
 * once they start panning.
 */
function FocusOnSelected({
  truck,
  remainingPath,
}: {
  truck: TruckLive | null;
  remainingPath: LatLng[] | null;
}) {
  const map = useMap();
  const lastKey = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!truck) return;
    const key = truck.id + (remainingPath ? `:${remainingPath.length}` : "");
    if (lastKey.current === key) return;

    const points: LatLng[] = [
      truck.origin.position,
      ...truck.traveled,
      truck.position,
      ...truck.nextStops.map((s) => s.position),
      ...(remainingPath ?? []),
    ];
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(([la, ln]) => [la, ln]));
    map.flyToBounds(bounds, { padding: [80, 80], duration: 0.6 });
    lastKey.current = key;
  }, [map, truck, remainingPath]);

  return null;
}

export default function MapClient({
  trucks = TRUCKS_LIVE,
  detailFocus = false,
  selectedTruckId,
  onSelectTruck,
  onOpenDetails,
  onMapClick,
  pendingStops,
  pendingOrigin,
}: Props) {
  const selectedTruck =
    trucks.find((t) => t.id === selectedTruckId) ?? null;

  // Compute the remaining route for the selected truck via /api/routes.
  const remaining = useRouteRemaining(
    selectedTruck ? selectedTruck.position : null,
    selectedTruck ? selectedTruck.nextStops : null,
  );

  const remainingPath: LatLng[] | null =
    remaining.data?.path ?? remaining.fallback;

  return (
    <MapContainer
      center={PARIS_CENTER}
      zoom={11}
      scrollWheelZoom
      zoomControl
      className="tt-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      <MapClickHandler onMapClick={onMapClick} />

      {/* Selected truck: traveled trail + remaining route + stops */}
      {selectedTruck ? (
        <>
          {selectedTruck.traveled.length >= 2 ? (
            <Polyline
              positions={selectedTruck.traveled}
              pathOptions={{
                color: STATUS_COLORS[selectedTruck.status],
                weight: 5,
                opacity: 0.35,
              }}
            />
          ) : null}

          {remainingPath && remainingPath.length >= 2 ? (
            <Polyline
              positions={remainingPath}
              pathOptions={{
                color: STATUS_COLORS[selectedTruck.status],
                weight: 5,
                opacity: 0.95,
              }}
            />
          ) : null}

          {/* Origin + every upcoming stop, with badges */}
          <Marker
            position={selectedTruck.origin.position}
            icon={buildStopIcon(
              selectedTruck.origin.kind,
              selectedTruck.origin.name,
            )}
          />
          {selectedTruck.nextStops.map((stop) => (
            <Marker
              key={stop.id}
              position={stop.position}
              icon={buildStopIcon(stop.kind, stop.name)}
            />
          ))}
        </>
      ) : null}

      {/* All trucks */}
      {trucks.map((truck) => {
        const selected = truck.id === selectedTruckId;
        return (
          <Marker
            key={truck.id}
            position={truck.position}
            icon={buildTruckIcon({
              plate: truck.plate,
              color: STATUS_COLORS[truck.status],
              selected,
              headingDeg: truck.headingDeg,
            })}
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectTruck(truck.id),
              popupclose: () => {
                // Only deselect if the user closed the popup AND we're not
                // showing the side drawer for this truck.
                // (Drawer-open state is tracked outside; we just keep selection.)
              },
            }}
          >
            <Popup
              autoPan
              closeButton
              maxWidth={280}
              minWidth={240}
              className="tt-popup-wrap"
            >
              <TruckPopup truck={truck} onOpenDetails={onOpenDetails} />
            </Popup>
          </Marker>
        );
      })}

      {/* Pending delivery preview (while the "new trajet" drawer is open) */}
      {pendingOrigin ? (
        <Marker
          position={pendingOrigin}
          icon={buildStopIcon("warehouse", "Départ")}
        />
      ) : null}
      {pendingStops && pendingStops.length > 0 ? (
        <>
          {pendingStops.map((s, i) => (
            <Marker
              key={`pending-${i}`}
              position={s.position}
              icon={buildStopIcon("delivery", s.name)}
            />
          ))}
          {pendingOrigin && pendingStops.length >= 1 ? (
            <Polyline
              positions={[
                pendingOrigin,
                ...pendingStops.map((s) => s.position),
                pendingOrigin,
              ]}
              pathOptions={{
                color: "var(--accent)",
                weight: 4,
                opacity: 0.55,
                dashArray: "6 8",
              }}
            />
          ) : null}
        </>
      ) : null}

      <FocusOnSelected
        truck={selectedTruck}
        remainingPath={remainingPath}
      />
      <InvalidateMapSize trigger={detailFocus ? "focus" : "default"} />
    </MapContainer>
  );
}
