"use client";

import * as React from "react";
import { Btn, Card, KeyStat, PageHeader, StatusDot } from "@/components/primitives";
import { Icon } from "@/components/icons";
import Map from "@/components/carte/Map";
import { TruckDetailDrawer } from "@/components/carte/TruckDetailDrawer";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TRUCKS_LIVE,
  type TruckLive,
} from "@/lib/trucks-live";

export default function CartePage() {
  const [trucks] = React.useState<TruckLive[]>(TRUCKS_LIVE);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const onTheRoad = trucks.filter((t) => t.status !== "arret").length;
  const stopped = trucks.length - onTheRoad;
  const totalStops = trucks.reduce((acc, t) => acc + t.nextStops.length, 0);

  const selectedTruck =
    trucks.find((t) => t.id === selectedId) ?? null;
  const detailFocus = drawerOpen && !!selectedTruck;

  const handleSelect = React.useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleOpenDetails = React.useCallback((id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  return (
    <div className={`tt-carte-page ${detailFocus ? "tt-carte-page--focus" : ""}`}>
      <PageHeader title="Carte temps réel" subtitle="Position en direct des camions">
        <Btn variant="secondary" icon={<Icon.filter size={14}/>}>Filtres</Btn>
      </PageHeader>

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
              trucks={trucks}
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
              {trucks.length} actifs
            </span>
          </div>
          <div>
            {trucks.map((t) => {
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
