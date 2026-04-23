"use client";

import * as React from "react";
import { Btn, Card, KeyStat, PageHeader, SearchInput, Segment, StatusDot } from "@/components/primitives";
import { Icon } from "@/components/icons";
import Map from "@/components/carte/Map";
import { TruckDetailDrawer } from "@/components/carte/TruckDetailDrawer";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TRUCKS_LIVE,
  type TruckLive,
  type TruckLiveStatus,
} from "@/lib/trucks-live";

type StatusFilter = "all" | TruckLiveStatus;

export default function CartePage() {
  const [trucks] = React.useState<TruckLive[]>(TRUCKS_LIVE);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [movingOnly, setMovingOnly] = React.useState(false);

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
  const detailFocus = drawerOpen && !!selectedTruck;

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

  const resetFilters = React.useCallback(() => {
    setStatusFilter("all");
    setSearch("");
    setMovingOnly(false);
  }, []);

  const activeFilters =
    (statusFilter !== "all" ? 1 : 0) +
    (movingOnly ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <div className={`tt-carte-page ${detailFocus ? "tt-carte-page--focus" : ""}`}>
      <PageHeader title="Carte temps réel" subtitle="Position en direct des camions">
        <Btn
          className="tt-carte-filter-toggle"
          variant="secondary"
          size="lg"
          icon={<Icon.filter size={14}/>}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          Filtres {activeFilters > 0 ? `(${activeFilters})` : ""}
        </Btn>
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
              selectedTruckId={selectedId}
              onSelectTruck={handleSelect}
              onOpenDetails={handleOpenDetails}
            />
          </div>
        </Card>

        <Card className="tt-carte-list-card" pad={0}>
          <div
            style={{ borderBottom: "1px solid var(--line)" }}
            className="flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-[13px] font-semibold -tracking-[0.005em]">Véhicules</span>
            <span style={{ color: "var(--ink-3)" }} className="text-[11.5px]">
              {filteredTrucks.length} / {trucks.length}
            </span>
          </div>
          <div>
            {filteredTrucks.length === 0 ? (
              <div style={{ color: "var(--ink-3)" }} className="px-4 py-6 text-[12.5px]">
                Aucun véhicule ne correspond aux filtres.
              </div>
            ) : null}
            {filteredTrucks.map((t) => {
              const next = t.nextStops[0];
              const isSelected = t.id === selectedId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelect(t.id)}
                  onDoubleClick={() => handleOpenDetails(t.id)}
                  data-selected={isSelected || undefined}
                  className="tt-truck-row"
                  style={{
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <StatusDot
                    color={STATUS_COLORS[t.status]}
                    size={8}
                    pulse={t.status !== "arret"}
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12.5px] font-semibold">{t.plate}</span>
                      <span style={{ color: "var(--ink-3)" }} className="text-[11.5px]">
                        · {t.driverName}
                      </span>
                    </div>
                    <div
                      style={{ color: "var(--ink-3)" }}
                      className="mt-px truncate text-[12px]"
                    >
                      {STATUS_LABELS[t.status]}
                      {next ? ` → ${next.name}` : ""}
                    </div>
                  </div>
                  <div
                    style={{ color: "var(--ink-2)" }}
                    className="text-right font-mono text-[12px]"
                  >
                    <div>
                      {next
                        ? new Date(next.plannedAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </div>
                    <div style={{ color: "var(--ink-4)" }} className="text-[11px]">
                      {t.load}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <TruckDetailDrawer
        truck={selectedTruck}
        open={drawerOpen}
        layout="split"
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
