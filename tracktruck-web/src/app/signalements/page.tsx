"use client";

import * as React from "react";
import { Card, Hairline, KeyStat, PageHeader, SearchInput, Segment } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { ApiIncidents } from "@/lib/api";
import { IncidentDialog, TYPE_META, timeAgo, parseLines } from "@/components/signalements/IncidentDialog";
import type { Incident, IncidentType } from "@/lib/types";

type TypeFilter = "all" | IncidentType;

function parseComment(comment?: string) {
  const lines = parseLines(comment);
  if (!lines.length) return { title: "Incident sans description" };
  return {
    title:      lines[0],
    route:      lines[1]?.startsWith("de ") || lines[1]?.startsWith("Sortie") ? lines[1] : undefined,
    details:    lines[2] ?? undefined,
    conditions: lines[3] ?? undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignalementsPage() {
  const [incidents, setIncidents]   = React.useState<Incident[]>([]);
  const [loading, setLoading]       = React.useState(true);
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [search, setSearch]         = React.useState("");
  const [selected, setSelected]     = React.useState<Incident | null>(null);

  React.useEffect(() => {
    ApiIncidents.list()
      .then(setIncidents)
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    let r = incidents;
    if (typeFilter !== "all") r = r.filter((i) => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((i) => i.comment?.toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [incidents, typeFilter, search]);

  const kpis = React.useMemo(() => ({
    total:  incidents.length,
    trafic: incidents.filter((i) => i.type === "external").length,
    retard: incidents.filter((i) => i.type === "delivery_delayed").length,
    panne:  incidents.filter((i) => i.type === "vehicle_breakdown").length,
  }), [incidents]);

  return (
    <>
      <PageHeader title="Signalements" subtitle="Incidents trafic et terrain en temps réel"/>

      <Card style={{ marginTop: 24, padding: "20px 24px" }} pad={0}>
        <div className="grid grid-cols-4 gap-6">
          <KeyStat label="Total signalements" value={kpis.total}/>
          <KeyStat label="Trafic externe"     value={kpis.trafic} tone={kpis.trafic > 0 ? "bad" : "good"}/>
          <KeyStat label="Retards livraison"  value={kpis.retard} tone={kpis.retard > 0 ? "bad" : "good"}/>
          <KeyStat label="Pannes véhicules"   value={kpis.panne}  tone={kpis.panne  > 0 ? "bad" : "good"}/>
        </div>
      </Card>

      <div className="mt-[22px] mb-[18px] flex flex-wrap items-center gap-3">
        <div className="min-w-[280px] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher dans les signalements…"/>
        </div>
        <Segment<TypeFilter>
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all",               label: "Tous"    },
            { value: "external",          label: "Trafic"  },
            { value: "delivery_delayed",  label: "Retards" },
            { value: "vehicle_breakdown", label: "Pannes"  },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)" }} className="py-20 text-center text-[13px]">
          Chargement des signalements…
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}>
          Aucun signalement ne correspond aux filtres.
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {filtered.map((incident, i) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              animIndex={i}
              onOpen={() => setSelected(incident)}
            />
          ))}
        </div>
      )}

      {selected && <IncidentDialog incident={selected} onClose={() => setSelected(null)}/>}
    </>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function IncidentCard({
  incident, animIndex = 0, onOpen,
}: { incident: Incident; animIndex?: number; onOpen: () => void }) {
  const meta   = TYPE_META[incident.type] ?? TYPE_META.external;
  const parsed = parseComment(incident.comment);

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
            background: meta.bg, color: meta.text,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {meta.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p style={{ color: "var(--ink-1)" }} className="m-0 text-[14.5px] font-semibold -tracking-[0.01em] leading-snug line-clamp-2">
              {parsed.title}
            </p>
            <span
              style={{ background: meta.bg, color: meta.text, flexShrink: 0 }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold"
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block" }}/>
              {meta.label}
            </span>
          </div>
          <div style={{ color: "var(--ink-4)" }} className="mt-1 flex items-center gap-1.5 text-[12px]">
            <Icon.clock size={11}/>
            {timeAgo(incident.timestamp)}
          </div>
        </div>
      </div>

      <div style={{ color: "var(--ink-2)" }} className="mt-4 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-[7px] text-[12.5px]">
        {parsed.route && (
          <><Icon.map   size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/><span>{parsed.route}</span></>
        )}
        {parsed.details && (
          <><Icon.alert size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/><span>{parsed.details}</span></>
        )}
        {parsed.conditions && (
          <><Icon.truck size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/><span>{parsed.conditions}</span></>
        )}
        <Icon.pin size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/>
        <span className="font-mono text-[11.5px]" style={{ color: "var(--ink-3)" }}>
          {incident.position.lat.toFixed(5)}, {incident.position.lng.toFixed(5)}
        </span>
      </div>

      <Hairline style={{ margin: "14px 0 10px" }}/>

      <div className="flex items-center justify-between text-[12px]">
        <span style={{ color: "var(--ink-4)" }}>
          {new Date(incident.timestamp).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </span>
        <span style={{ color: "var(--accent-ink)" }} className="inline-flex items-center gap-1 font-[550]">
          Voir le détail <Icon.chevronR size={12}/>
        </span>
      </div>
    </div>
  );
}