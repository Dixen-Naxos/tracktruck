"use client";

import * as React from "react";
import { Icon } from "./icons";
import { StatusDot } from "./primitives";
import { useApp } from "@/context/AppContext";

export function TopBar() {
  const { toast } = useApp();
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

      <div className="flex-1" />

      <button
        onClick={() => toast("3 nouvelles notifications", "info")}
        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)" }}
        className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px]"
      >
        <Icon.bell size={16}/>
        <span
          style={{ background: "var(--danger)", boxShadow: "0 0 0 2px var(--surface)" }}
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
        />
      </button>
      <button
        style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)" }}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px]"
        aria-label="Aide"
      >
        <Icon.help size={16}/>
      </button>
    </div>
  );
}
