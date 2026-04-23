"use client";

import * as React from "react";
import { PageHeader, Card, KeyStat, Btn, StatusDot } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { SchematicMap } from "@/components/SchematicMap";
import { VEHICLES, DRIVERS } from "@/lib/data";
import { useApp } from "@/context/AppContext";

export default function CartePage() {
  const { tweaks } = useApp();
  const onTheRoad = VEHICLES.filter((v) => v.status !== "arret").length;

  return (
    <>
      <PageHeader title="Carte temps réel" subtitle="Flotte active — vue d'ensemble">
        <Btn variant="secondary" icon={<Icon.filter size={14}/>}>Filtres</Btn>
      </PageHeader>

      <Card style={{ marginTop: 24, padding: "20px 24px" }} pad={0}>
        <div className="grid grid-cols-4 gap-6">
          <KeyStat label="Véhicules actifs" value={onTheRoad} tone="good"/>
          <KeyStat label="Commandes en cours" value={42}/>
          <KeyStat label="Retards" value={1} tone="bad"/>
          <KeyStat label="Incidents" value={2} tone="bad"/>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-[1fr_320px] gap-4">
        <SchematicMap style={tweaks.map} height={520}/>
        <Card pad={0}>
          <div
            style={{ borderBottom: "1px solid var(--line)" }}
            className="flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-[13px] font-semibold -tracking-[0.005em]">Véhicules</span>
            <span style={{ color: "var(--ink-3)" }} className="text-[11.5px]">{VEHICLES.length} actifs</span>
          </div>
          <div>
            {VEHICLES.map((v) => {
              const d = DRIVERS.find((x) => x.id === v.driverId);
              const color =
                v.status === "arret" ? "var(--danger)" :
                v.status === "retour" ? "var(--ink-3)" :
                "var(--accent)";
              return (
                <div
                  key={v.id}
                  style={{ borderBottom: "1px solid var(--line)" }}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)]"
                >
                  <StatusDot color={color} size={8} pulse={v.status !== "arret"}/>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12.5px] font-semibold">{v.id}</span>
                      <span style={{ color: "var(--ink-3)" }} className="text-[11.5px]">· {d?.firstName} {d?.lastName}</span>
                    </div>
                    <div style={{ color: "var(--ink-3)" }} className="mt-px truncate text-[12px]">
                      {v.from} → {v.to}
                    </div>
                  </div>
                  <div style={{ color: "var(--ink-2)" }} className="text-right font-mono text-[12px]">
                    <div>{v.eta}</div>
                    <div style={{ color: "var(--ink-4)" }} className="text-[11px]">{v.load}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
