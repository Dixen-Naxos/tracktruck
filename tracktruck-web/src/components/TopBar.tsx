"use client";

import * as React from "react";
import { StatusDot } from "./primitives";

export function TopBar() {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const time = now?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) ?? "";
  const date = now?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) ?? "";

  return (
    <div style={{ color: "var(--ink-3)" }} className="mb-[26px] flex items-center gap-3.5 text-[12.5px]">
      <div
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
      >
        <StatusDot color="var(--success)" size={7} pulse />
        <span style={{ color: "var(--ink-2)" }} className="font-medium">Tous systèmes opérationnels</span>
      </div>
      <span style={{ color: "var(--ink-4)" }}>·</span>
      <span className="capitalize">{date}</span>
      <span style={{ color: "var(--ink-4)" }}>·</span>
      <span style={{ color: "var(--ink-2)" }} className="font-mono tabular-nums">{time}</span>

    </div>
  );
}
