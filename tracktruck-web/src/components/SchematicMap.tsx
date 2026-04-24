"use client";

import * as React from "react";
import { StatusDot } from "./primitives";

interface Route {
  id: string;
  driven: string;
  planned: string;
  marker: [number, number];
  status: "ok" | "warn" | "danger";
}

const ROUTES: Route[] = [
  { id: "V-01", driven: "M80,310 L200,300 L260,240 L320,220", planned: "M320,220 L440,210 L520,170", marker: [520, 170], status: "ok" },
  { id: "V-02", driven: "M150,120 L260,130 L360,130",         planned: "M360,130 L460,130 L560,160", marker: [560, 160], status: "ok" },
  { id: "V-03", driven: "M700,90 L760,140 L820,180",           planned: "M820,180 L870,260 L840,340", marker: [840, 340], status: "warn" },
  { id: "V-04", driven: "M420,320 L520,340 L600,320",          planned: "M600,320 L700,300 L780,240", marker: [780, 240], status: "ok" },
  { id: "V-05", driven: "M220,360 L320,360",                    planned: "M320,360 L420,360 L520,360", marker: [520, 360], status: "danger" },
];

const STATUS_COLOR: Record<Route["status"], string> = {
  ok:     "var(--accent)",
  warn:   "var(--warn)",
  danger: "var(--danger)",
};

export function SchematicMap({
  style = "schematic", height = 420,
}: { style?: "schematic" | "realistic"; height?: number }) {
  if (style === "realistic") {
    return (
      <div
        style={{
          height,
          background:
            "radial-gradient(60% 80% at 30% 20%, oklch(0.94 0.02 230) 0%, transparent 60%)," +
            "radial-gradient(50% 60% at 80% 70%, oklch(0.95 0.02 120) 0%, transparent 60%)," +
            "linear-gradient(180deg, oklch(0.97 0.01 230), oklch(0.95 0.01 110))",
          border: "1px solid var(--line)",
        }}
        className="relative overflow-hidden rounded-[14px]"
      >
        <svg viewBox="0 0 1200 420" width="100%" height="100%">
          {Array.from({ length: 18 }).map((_, i) => (
            <path
              key={i}
              d={`M${i * 80},0 Q${i * 80 + 40},${height / 2} ${i * 80},${height}`}
              stroke="oklch(0.85 0.02 230)" strokeWidth="1" fill="none" opacity=".35"
            />
          ))}
          <path d="M0,260 Q300,200 600,240 T1200,220" stroke="oklch(0.88 0.01 230)" strokeWidth="16" fill="none" opacity=".5"/>
          <path d="M0,260 Q300,200 600,240 T1200,220" stroke="oklch(0.98 0 0)" strokeWidth="2" fill="none" strokeDasharray="6 8"/>
          <RouteLayer />
        </svg>
      </div>
    );
  }

  const dots: [number, number][] = [];
  for (let x = 20; x < 1200; x += 34) for (let y = 20; y < height; y += 34) dots.push([x, y]);

  return (
    <div
      style={{
        height, background: "linear-gradient(180deg, var(--surface-2), var(--surface))",
        border: "1px solid var(--line)",
      }}
      className="relative overflow-hidden rounded-[14px]"
    >
      <svg viewBox="0 0 1200 420" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="var(--ink-4)" opacity=".3"/>
        ))}
        <ellipse cx="520" cy="210" rx="260" ry="90" fill="none" stroke="var(--line-strong)" strokeDasharray="3 5"/>
        <text x="530" y="130" fontSize="10.5" fill="var(--ink-4)" fontFamily="var(--font-mono)" letterSpacing="2">
          ZONE · IDF-OUEST
        </text>
        <RouteLayer />
      </svg>
      <Legend />
    </div>
  );
}

function RouteLayer() {
  return (
    <g>
      {ROUTES.map((r) => (
        <g key={r.id}>
          <path d={r.driven}  stroke={STATUS_COLOR[r.status]} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d={r.planned} stroke={STATUS_COLOR[r.status]} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="4 6" opacity=".55"/>
          <circle cx={r.marker[0]} cy={r.marker[1]} r="9" fill={STATUS_COLOR[r.status]}/>
          <circle cx={r.marker[0]} cy={r.marker[1]} r="15" fill={STATUS_COLOR[r.status]} opacity=".18"/>
          <text x={r.marker[0] + 16} y={r.marker[1] + 4} fontSize="11" fontWeight="600" fill="var(--ink-1)">{r.id}</text>
        </g>
      ))}
    </g>
  );
}

function Legend() {
  const items: { c: string; l: string }[] = [
    { c: "var(--accent)", l: "En route" },
    { c: "var(--warn)",   l: "Incident mineur" },
    { c: "var(--danger)", l: "Incident majeur" },
  ];
  return (
    <div
      style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        boxShadow: "var(--shadow-sm)",
      }}
      className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-[10px] px-3.5 py-2.5"
    >
      <div style={{ color: "var(--ink-3)" }} className="text-[10.5px] font-semibold uppercase tracking-[0.5px]">Légende</div>
      {items.map((i) => (
        <div key={i.l} style={{ color: "var(--ink-2)" }} className="flex items-center gap-2 text-[12px]">
          <StatusDot color={i.c} size={7}/> {i.l}
        </div>
      ))}
    </div>
  );
}
