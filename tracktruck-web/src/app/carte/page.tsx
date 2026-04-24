"use client";

import * as React from "react";
import { Btn, Card, KeyStat, PageHeader, SearchInput, Segment, StatusDot } from "@/components/primitives";
import { Icon } from "@/components/icons";
import Map from "@/components/carte/Map";
import { TruckDetailDrawer } from "@/components/carte/TruckDetailDrawer";
import { NewDeliveryDrawer } from "@/components/carte/NewDeliveryDrawer";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type LatLng,
  type RouteStop,
  type TruckLive,
  type TruckLiveStatus,
} from "@/lib/trucks-live";
import { fetchTrucksLive } from "@/lib/trucks-live-api";

type StatusFilter = "all" | TruckLiveStatus;

function isStopLocked(stop: RouteStop): boolean {
  return !!stop.completedAt;
}

export default function CartePage() {
  const [trucks, setTrucks] = React.useState<TruckLive[]>([]);
  const [trucksStatus, setTrucksStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [trucksError, setTrucksError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [movingOnly, setMovingOnly] = React.useState(false);
  const [mapClickPosition, setMapClickPosition] = React.useState<LatLng | null>(null);
  const [mapClickVersion, setMapClickVersion] = React.useState(0);
  const [newDeliveryOpen, setNewDeliveryOpen] = React.useState(false);
  const [newDeliveryClickPosition, setNewDeliveryClickPosition] =
    React.useState<LatLng | null>(null);
  const [newDeliveryClickVersion, setNewDeliveryClickVersion] = React.useState(0);
  const [newDeliveryPendingStops, setNewDeliveryPendingStops] = React.useState<
    Array<{ position: LatLng; name: string }>
  >([]);
  const [newDeliveryDeparture, setNewDeliveryDeparture] =
    React.useState<LatLng | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  // Load trucks from the backend. Re-poll every 10s to keep positions fresh.
  React.useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = async (isInitial: boolean) => {
      if (isInitial) setTrucksStatus("loading");
      try {
        const next = await fetchTrucksLive();
        if (cancelled) return;
        setTrucks(next);
        setTrucksStatus("success");
        setTrucksError(null);
      } catch (err) {
        if (cancelled) return;
        setTrucksStatus("error");
        setTrucksError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) {
          timer = setTimeout(() => load(false), 10_000);
        }
      }
    };

    load(true);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reloadKey]);

  const filteredTrucks = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return trucks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (movingOnly && t.status === "arret") return false;
      if (!q) return true;
      const next = t.nextStops[0];
      return (
        t.plate.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.driverId.toLowerCase().includes(q) ||
        (next?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [movingOnly, search, statusFilter, trucks]);

  const onTheRoad = filteredTrucks.filter((t) => t.status !== "arret").length;
  const stopped = filteredTrucks.length - onTheRoad;
  const totalStops = filteredTrucks.reduce((acc, t) => acc + t.nextStops.length, 0);

  const selectedTruck =
    filteredTrucks.find((t) => t.id === selectedId) ?? null;
  const detailFocus = (drawerOpen && !!selectedTruck) || newDeliveryOpen;

  React.useEffect(() => {
    if (!selectedId) return;
    if (filteredTrucks.some((t) => t.id === selectedId)) return;
    setSelectedId(null);
    setDrawerOpen(false);
  }, [filteredTrucks, selectedId]);

  const handleSelect = React.useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleOpenDetails = React.useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const handleMapClickAddStop = React.useCallback(
    (position: LatLng) => {
      // When the "new delivery" drawer is open, clicks feed that form.
      if (newDeliveryOpen) {
        setNewDeliveryClickPosition(position);
        setNewDeliveryClickVersion((v) => v + 1);
        return;
      }
      if (!selectedId) return;
      setDrawerOpen(true);
      setMapClickPosition(position);
      setMapClickVersion((v) => v + 1);
    },
    [newDeliveryOpen, selectedId],
  );

  const openNewDelivery = React.useCallback(() => {
    // Close the truck detail drawer first so the split layout swaps smoothly.
    setDrawerOpen(false);
    setNewDeliveryOpen(true);
  }, []);

  const closeNewDelivery = React.useCallback(() => {
    setNewDeliveryOpen(false);
    setNewDeliveryPendingStops([]);
    setNewDeliveryDeparture(null);
  }, []);

  const handleNewDeliveryCreated = React.useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const resetFilters = React.useCallback(() => {
    setStatusFilter("all");
    setSearch("");
    setMovingOnly(false);
  }, []);

  const updateTruckStops = React.useCallback(
    (truckId: string, updater: (stops: RouteStop[]) => RouteStop[]) => {
      setTrucks((prev) =>
        prev.map((truck) => {
          if (truck.id !== truckId) return truck;
          return {
            ...truck,
            nextStops: updater(truck.nextStops),
          };
        }),
      );
    },
    [],
  );

  const handleAddStop = React.useCallback(
    (
      truckId: string,
      values: {
        name: string;
        address: string;
        kind: RouteStop["kind"];
        position: [number, number];
      },
    ) => {
      const plannedAt = new Date(Date.now() + 30 * 60_000).toISOString();

      const newStop: RouteStop = {
        id: `STOP-${crypto.randomUUID()}`,
        kind: values.kind,
        name: values.name,
        address: values.address,
        position: values.position,
        plannedAt,
      };

      updateTruckStops(truckId, (stops) => [...stops, newStop]);
    },
    [updateTruckStops],
  );

  const handleEditStop = React.useCallback(
    (
      truckId: string,
      stopIndex: number,
      values: {
        name: string;
        address: string;
        kind: RouteStop["kind"];
        position: [number, number];
      },
    ) => {
      updateTruckStops(truckId, (stops) => {
        const stop = stops[stopIndex];
        if (!stop) return stops;
        if (isStopLocked(stop)) return stops;

        return stops.map((item, index) =>
          index === stopIndex
            ? {
                ...item,
                name: values.name,
                address: values.address,
                kind: values.kind,
                position: values.position,
              }
            : item,
        );
      });
    },
    [updateTruckStops],
  );

  const handleDeleteStop = React.useCallback(
    (truckId: string, stopIndex: number) => {
      updateTruckStops(truckId, (stops) => {
        const stop = stops[stopIndex];
        if (!stop || isStopLocked(stop)) return stops;
        return stops.filter((_, index) => index !== stopIndex);
      });
    },
    [updateTruckStops],
  );

  const handleReorderStop = React.useCallback(
    (truckId: string, fromIndex: number, toIndex: number) => {
      updateTruckStops(truckId, (stops) => {
        if (fromIndex < 0 || fromIndex >= stops.length) return stops;
        if (toIndex < 0 || toIndex >= stops.length) return stops;
        if (fromIndex === toIndex) return stops;

        const fromStop = stops[fromIndex];
        const toStop = stops[toIndex];
        if (!fromStop || !toStop || isStopLocked(fromStop) || isStopLocked(toStop)) {
          return stops;
        }

        const next = [...stops];
        const [moved] = next.splice(fromIndex, 1);
        if (!moved) return stops;
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [updateTruckStops],
  );

  const activeFilters =
    (statusFilter !== "all" ? 1 : 0) +
    (movingOnly ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <div className={`tt-carte-page ${detailFocus ? "tt-carte-page--focus" : ""}`}>
      <PageHeader title="Carte temps réel" subtitle="Position en direct des camions">
        <div className="flex items-center gap-2">
          <Btn
            className="tt-carte-filter-toggle"
            variant="secondary"
            size="lg"
            icon={<Icon.filter size={14}/>}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Filtres {activeFilters > 0 ? `(${activeFilters})` : ""}
          </Btn>
          <Btn
            variant="primary"
            size="lg"
            icon={<Icon.plus size={14}/>}
            onClick={openNewDelivery}
          >
            Nouveau trajet
          </Btn>
        </div>
      </PageHeader>

      {filtersOpen ? (
        <Card className="tt-carte-filters tt-fade-in" style={{ marginTop: 16, padding: "14px 16px" }}>
          <div className="tt-carte-filters__head">
            <span>Filtrer les véhicules affichés</span>
            <span>{filteredTrucks.length} résultat{filteredTrucks.length > 1 ? "s" : ""}</span>
          </div>

          <div className="tt-carte-filters__row">
            <div className="tt-carte-filters__search">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Plaque, chauffeur, arrêt suivant…"
              />
            </div>
            <div className="tt-carte-filters__segment">
              <Segment<StatusFilter>
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Tous" },
                  { value: "en-route", label: "En route" },
                  { value: "livraison", label: "Livraison" },
                  { value: "retour", label: "Retour" },
                  { value: "arret", label: "Arrêt" },
                ]}
              />
            </div>
            <label className="tt-carte-filters__toggle">
              <input
                type="checkbox"
                checked={movingOnly}
                onChange={(e) => setMovingOnly(e.target.checked)}
              />
              En mouvement uniquement
            </label>
            <Btn className="tt-carte-filters__reset" variant="ghost" size="lg" onClick={resetFilters}>
              Réinitialiser
            </Btn>
          </div>

          {activeFilters > 0 ? (
            <div className="tt-carte-filters__chips">
              {movingOnly ? (
                <span className="tt-carte-filter-chip">En mouvement</span>
              ) : null}
              {search.trim() ? (
                <span className="tt-carte-filter-chip">Recherche: {search.trim()}</span>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card className="tt-carte-kpis" style={{ marginTop: 24, padding: "20px 24px" }} pad={0}>
        <div className="grid grid-cols-4 gap-6">
          <KeyStat label="Véhicules en route" value={onTheRoad} tone="good"/>
          <KeyStat label="À l'arrêt" value={stopped} tone={stopped > 0 ? "bad" : undefined}/>
          <KeyStat label="Arrêts restants" value={totalStops}/>
          <KeyStat label="Incidents" value={2} tone="bad"/>
        </div>
      </Card>

      <div className="tt-carte-layout">
        <Card className="tt-carte-map-card" pad={0} style={{ overflow: "hidden" }}>
          <div className={`tt-map-wrap tt-carte-map-wrap ${detailFocus ? "tt-carte-map-wrap--focus" : ""}`}>
            <Map
              trucks={filteredTrucks}
              detailFocus={detailFocus}
              selectedTruckId={selectedId}
              onSelectTruck={handleSelect}
              onOpenDetails={handleOpenDetails}
              onMapClick={handleMapClickAddStop}
              pendingStops={newDeliveryOpen ? newDeliveryPendingStops : null}
              pendingOrigin={newDeliveryOpen ? newDeliveryDeparture : null}
            />
          </div>
        </Card>

        <Card className="tt-carte-list-card" pad={0}>
          <div className="tt-carte-list-head">
            <div>
              <h3>Véhicules</h3>
              <p>Cliquer pour suivre, double-cliquer pour ouvrir les détails.</p>
            </div>
            <span className="tt-carte-list-count">
              {filteredTrucks.length} / {trucks.length}
            </span>
          </div>

          <div className="tt-carte-list-body">
            {trucksStatus === "loading" && trucks.length === 0 ? (
              <div className="tt-carte-list-empty">Chargement des véhicules…</div>
            ) : null}
            {trucksStatus === "error" ? (
              <div className="tt-carte-list-empty">
                Erreur de chargement : {trucksError ?? "—"}
              </div>
            ) : null}
            {trucksStatus === "success" &&
            trucks.length > 0 &&
            filteredTrucks.length === 0 ? (
              <div className="tt-carte-list-empty">
                Aucun véhicule ne correspond aux filtres.
              </div>
            ) : null}
            {trucksStatus === "success" && trucks.length === 0 ? (
              <div className="tt-carte-list-empty">
                Aucun camion dans la flotte pour l&apos;instant.
              </div>
            ) : null}
            {filteredTrucks.map((t) => {
              const next = t.nextStops[0];
              const isSelected = t.id === selectedId;
              const eta = next
                ? new Date(next.plannedAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelect(t.id)}
                  onDoubleClick={() => handleOpenDetails(t.id)}
                  data-selected={isSelected || undefined}
                  className="tt-carte-vehicle-item"
                >
                  <div className="tt-carte-vehicle-item__top">
                    <div className="tt-carte-vehicle-item__plate">
                      <StatusDot
                        color={STATUS_COLORS[t.status]}
                        size={8}
                        pulse={t.status !== "arret"}
                      />
                      <span>{t.plate}</span>
                    </div>
                    <span
                      className="tt-carte-vehicle-item__status"
                      style={{
                        color: STATUS_COLORS[t.status],
                        background: `color-mix(in oklab, ${STATUS_COLORS[t.status]} 14%, transparent)`,
                      }}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </div>

                  <div className="tt-carte-vehicle-item__driver">{t.driverName}</div>

                  <div className="tt-carte-vehicle-item__route">
                    {next ? `Prochain arrêt: ${next.name}` : "Aucun arrêt restant"}
                  </div>

                  <div className="tt-carte-vehicle-item__foot">
                    <span>ETA {eta}</span>
                    <span>Charge {t.load}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <TruckDetailDrawer
        truck={selectedTruck}
        open={drawerOpen && !newDeliveryOpen}
        layout="split"
        onClose={() => setDrawerOpen(false)}
        onAddStop={handleAddStop}
        onEditStop={handleEditStop}
        onDeleteStop={handleDeleteStop}
        onReorderStop={handleReorderStop}
        mapClickPosition={mapClickPosition}
        mapClickVersion={mapClickVersion}
      />
      <NewDeliveryDrawer
        open={newDeliveryOpen}
        onClose={closeNewDelivery}
        mapClickPosition={newDeliveryClickPosition}
        mapClickVersion={newDeliveryClickVersion}
        onCreated={handleNewDeliveryCreated}
        onStopsChange={setNewDeliveryPendingStops}
        onDepartureChange={setNewDeliveryDeparture}
      />
    </div>
  );
}
