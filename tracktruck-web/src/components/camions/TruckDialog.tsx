"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { Icon } from "@/components/icons";
import { FUEL_META } from "./TruckCard";
import type { Truck } from "@/lib/types";

interface Props {
  truck: Truck;
  onClose: () => void;
}

export function TruckDialog({ truck, onClose }: Props) {
  const fuel = FUEL_META[truck.fuelType] ?? FUEL_META.diesel;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const header = (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 12, right: 12, background: "var(--surface-2)", color: "var(--ink-3)" }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0"
        aria-label="Fermer"
      >
        <Icon.close size={16}/>
      </button>

      <div style={{ padding: "22px 26px 20px", borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 60, height: 60, borderRadius: 60 * 0.32, flexShrink: 0,
              background: "var(--surface-2)", border: "1px solid var(--line)",
              color: "var(--ink-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon.truck size={26}/>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="m-0 font-mono text-[24px] font-bold -tracking-[0.01em]">
                {truck.plateNumber}
              </h2>
              <span
                style={{ background: fuel.bg, color: fuel.text }}
                className="rounded-full px-2.5 py-[3px] text-[12px] font-semibold"
              >
                {fuel.label}
              </span>
            </div>
            <div style={{ color: "var(--ink-3)" }} className="mt-1 text-[13px]">
              Capacité {truck.packageCapacity} colis · {truck.fuelConsumptionL100km} L/100km
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      visible
      modal
      closable={false}
      draggable={false}
      resizable={false}
      onHide={onClose}
      header={header}
      pt={{
        mask: {
          style: {
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(15,17,28,0.35)", backdropFilter: "blur(8px)",
          },
        },
        root: {
          style: {
            width: "min(520px, calc(100vw - 48px))",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            boxShadow: "var(--shadow-lg)",
          },
        },
        header:      { style: { padding: 0, borderRadius: "20px 20px 0 0", background: "transparent" } },
        headerTitle: { style: { width: "100%" } },
        content:     { style: { padding: "22px 26px 26px", background: "var(--surface)", borderRadius: "0 0 20px 20px" } },
      }}
    >
      <div className="grid gap-5">
        <section>
          <SectionTitle>Caractéristiques techniques</SectionTitle>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12 }}>
            <DetailRow icon={<Icon.truck size={14}/>} label="Immatriculation">
              <span className="font-mono text-[14px] font-bold">{truck.plateNumber}</span>
            </DetailRow>
            <DetailRow icon={<Icon.gear size={14}/>} label="Carburant">
              <span
                style={{ background: fuel.bg, color: fuel.text }}
                className="rounded-full px-2 py-[2px] text-[12px] font-semibold"
              >
                {fuel.label}
              </span>
            </DetailRow>
            <DetailRow icon={<Icon.box size={14}/>} label="Capacité">
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px] tabular-nums font-semibold">
                {truck.packageCapacity} colis
              </span>
            </DetailRow>
            <DetailRow icon={<Icon.sparkle size={14}/>} label="Consommation" last>
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px] tabular-nums font-semibold">
                {truck.fuelConsumptionL100km} L / 100 km
              </span>
            </DetailRow>
          </div>
        </section>
      </div>
    </Dialog>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: "var(--ink-3)" }} className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.4px]">
      {children}
    </div>
  );
}

function DetailRow({
  icon, label, children, last = false,
}: { icon: React.ReactNode; label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{ borderBottom: last ? "none" : "1px solid var(--line)" }}
      className="grid grid-cols-[140px_1fr] items-center gap-3 px-4 py-3"
    >
      <span style={{ color: "var(--ink-3)" }} className="inline-flex items-center gap-2 text-[12.5px]">
        <span style={{ color: "var(--ink-4)" }}>{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}
