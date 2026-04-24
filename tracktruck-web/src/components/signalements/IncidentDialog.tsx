"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { Icon } from "@/components/icons";
import type { Incident, IncidentType } from "@/lib/types";

export const TYPE_META: Record<IncidentType, { label: string; dot: string; text: string; bg: string; icon: React.ReactNode }> = {
  external:          { label: "Trafic", dot: "var(--warn)",         text: "var(--warn)",         bg: "var(--warn-soft)",    icon: <Icon.alert size={18}/> },
  delivery_delayed:  { label: "Retard", dot: "oklch(0.72 0.18 40)", text: "oklch(0.55 0.18 40)", bg: "oklch(0.97 0.04 40)", icon: <Icon.clock size={18}/> },
  vehicle_breakdown: { label: "Panne",  dot: "var(--danger)",       text: "var(--danger)",       bg: "var(--danger-soft)",  icon: <Icon.truck size={18}/> },
};

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `Il y a ${diff}s`;
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function parseLines(comment?: string): string[] {
  if (!comment) return [];
  return comment.split("\n").map((l) => l.trim()).filter(Boolean);
}

interface Props {
  incident: Incident;
  onClose: () => void;
}

export function IncidentDialog({ incident, onClose }: Props) {
  const meta     = TYPE_META[incident.type] ?? TYPE_META.external;
  const lines    = parseLines(incident.comment);
  const mapsUrl  = `https://www.google.com/maps?q=${incident.position.lat},${incident.position.lng}`;

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
              width: 56, height: 56, borderRadius: 56 * 0.32, flexShrink: 0,
              background: meta.bg, color: meta.text,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="m-0 text-[20px] font-[650] -tracking-[0.02em] leading-snug">
                {lines[0] ?? "Incident"}
              </h2>
              <span
                style={{ background: meta.bg, color: meta.text }}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] font-semibold"
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "inline-block" }}/>
                {meta.label}
              </span>
            </div>
            <div style={{ color: "var(--ink-4)" }} className="mt-1.5 flex items-center gap-2 text-[12.5px]">
              <Icon.clock size={12}/>
              {new Date(incident.timestamp).toLocaleString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
              })}
              <span>·</span>
              <span>{timeAgo(incident.timestamp)}</span>
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
            width: "min(640px, calc(100vw - 48px))",
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
        {lines.length > 1 && (
          <section>
            <SectionTitle>Description complète</SectionTitle>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12 }} className="grid gap-0">
              {lines.map((line, i) => (
                <div
                  key={i}
                  style={{ borderBottom: i < lines.length - 1 ? "1px solid var(--line)" : "none" }}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <span
                    style={{ background: meta.bg, color: meta.text }}
                    className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">{line}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle>Localisation</SectionTitle>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12 }} className="grid gap-0">
            <DetailRow icon={<Icon.pin size={14}/>} label="Coordonnées GPS">
              <span className="font-mono text-[13px]">
                {incident.position.lat.toFixed(6)}, {incident.position.lng.toFixed(6)}
              </span>
            </DetailRow>
            <DetailRow icon={<Icon.map size={14}/>} label="Voir sur la carte" last>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent-ink)" }}
                className="inline-flex items-center gap-1 text-[13px] font-[550]"
                onClick={(e) => e.stopPropagation()}
              >
                Ouvrir Google Maps <Icon.chevronR size={12}/>
              </a>
            </DetailRow>
          </div>
        </section>

        <section>
          <SectionTitle>Métadonnées</SectionTitle>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12 }} className="grid gap-0">
            <DetailRow icon={<Icon.alert size={14}/>} label="Type d'incident">
              <span
                style={{ background: meta.bg, color: meta.text }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[12px] font-semibold"
              >
                {meta.label}
              </span>
            </DetailRow>
            <DetailRow icon={<Icon.clock size={14}/>} label="Horodatage" last>
              <span style={{ color: "var(--ink-1)" }} className="text-[13px]">
                {new Date(incident.timestamp).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long",
                  year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
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
      className="grid grid-cols-[130px_1fr] items-center gap-3 px-4 py-3"
    >
      <span style={{ color: "var(--ink-3)" }} className="inline-flex items-center gap-2 text-[12.5px]">
        <span style={{ color: "var(--ink-4)" }}>{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}