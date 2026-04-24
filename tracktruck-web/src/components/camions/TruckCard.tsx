"use client";

import * as React from "react";
import { Hairline } from "@/components/primitives";
import { Icon } from "@/components/icons";
import type { FuelType, Truck } from "@/lib/types";

export const FUEL_META: Record<FuelType, { label: string; bg: string; text: string }> = {
  diesel:     { label: "Diesel",     bg: "oklch(0.94 0.02 240)",  text: "oklch(0.4 0.1 240)"  },
  essence:    { label: "Essence",    bg: "var(--warn-soft)",      text: "var(--warn)"          },
  electrique: { label: "Électrique", bg: "var(--success-soft)",   text: "var(--success)"       },
  hybride:    { label: "Hybride",    bg: "oklch(0.95 0.04 180)",  text: "oklch(0.45 0.14 180)" },
  gpl:        { label: "GPL",        bg: "var(--accent-softer)",  text: "var(--accent-ink)"    },
};

function plateTone(plate: string): number {
  return plate.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

export function TruckCard({
  truck, animIndex = 0, onOpen,
}: { truck: Truck; animIndex?: number; onOpen: () => void }) {
  const fuel = FUEL_META[truck.fuelType] ?? FUEL_META.diesel;
  const tone = plateTone(truck.plateNumber);

  return (
    <div
      onClick={onOpen}
      className="tt-hover-lift tt-row-in cursor-pointer"
      style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 16, padding: 20,
        animationDelay: `${Math.min(animIndex * 40, 300)}ms`,
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          style={{
            width: 52, height: 52, borderRadius: 52 * 0.32, flexShrink: 0,
            background: `linear-gradient(135deg, oklch(0.93 0.035 ${tone}), oklch(0.97 0.02 ${tone}))`,
            color: `oklch(0.35 0.12 ${tone})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon.truck size={22}/>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[17px] font-bold -tracking-[0.01em]">
              {truck.plateNumber}
            </span>
            <span
              style={{ background: fuel.bg, color: fuel.text, flexShrink: 0 }}
              className="rounded-full px-2 py-[3px] text-[11px] font-semibold"
            >
              {fuel.label}
            </span>
          </div>
          <div style={{ color: "var(--ink-3)" }} className="mt-0.5 text-[12.5px]">
            Capacité : <span style={{ color: "var(--ink-1)" }} className="font-semibold">{truck.packageCapacity} colis</span>
          </div>
        </div>
      </div>

      <div style={{ color: "var(--ink-2)" }} className="mt-4 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-[7px] text-[12.5px]">
        <Icon.box   size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/>
        <span>Capacité <span style={{ color: "var(--ink-1)" }} className="font-semibold tabular-nums">{truck.packageCapacity}</span> colis</span>
        <Icon.gear  size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/>
        <span>Consommation <span style={{ color: "var(--ink-1)" }} className="font-semibold tabular-nums">{truck.fuelConsumptionL100km} L/100km</span></span>
      </div>

      <Hairline style={{ margin: "14px 0 10px" }}/>

      <div className="flex items-center justify-end text-[12px]">
        <span style={{ color: "var(--accent-ink)" }} className="inline-flex items-center gap-1 font-[550]">
          Voir le détail <Icon.chevronR size={12}/>
        </span>
      </div>
    </div>
  );
}
