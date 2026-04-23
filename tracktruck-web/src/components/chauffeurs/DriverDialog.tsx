"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { Avatar, Btn, Hairline, KeyStat, StatusPill } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { SKILLS } from "@/lib/data";
import type { Driver } from "@/lib/types";

const TABS = [
  { id: "apercu",      l: "Aperçu"         },
  { id: "competences", l: "Compétences"    },
  { id: "planning",    l: "Disponibilités" },
  { id: "historique",  l: "Historique"     },
] as const;

type TabId = typeof TABS[number]["id"];

interface Props {
  driver: Driver;
  onClose: () => void;
}

export function DriverDialog({ driver, onClose }: Props) {
  const [tab, setTab] = React.useState<TabId>("apercu");

  const header = (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 12, right: 12, background: "var(--surface-2)", color: "var(--ink-3)" }}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0"
        aria-label="Fermer"
      >
        <Icon.close size={16} />
      </button>

      <div
        style={{
          background: `linear-gradient(135deg, oklch(0.97 0.025 ${driver.avatarTone}), var(--surface))`,
          padding: "22px 26px 0",
        }}
      >
        <div className="flex items-start gap-[18px]">
          <Avatar initials={driver.initials} tone={driver.avatarTone} size={72} ring />
          <div className="min-w-0 flex-1 pt-[2px]">
            <div className="flex items-center gap-2.5">
              <h2 className="m-0 text-[24px] font-[650] -tracking-[0.025em]">
                {driver.firstName} {driver.lastName}
              </h2>
              {driver.rating >= 4.9 && (
                <span
                  style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] font-semibold"
                >
                  <Icon.sparkle size={11} /> Top chauffeur
                </span>
              )}
            </div>
            <div style={{ color: "var(--ink-3)" }} className="mt-1.5 flex items-center gap-3 text-[13px]">
              <span className="font-mono">{driver.matricule}</span>
              <span>·</span>
              <span>
                Chez TrackTruck depuis{" "}
                {new Date(driver.since).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill status={driver.status} />
              <span
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12px] font-[550]"
              >
                <Icon.truck size={12} /> {driver.vehicle}
              </span>
              <span
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12px] font-[550]"
              >
                <Icon.star size={11} style={{ fill: "var(--warn)", color: "var(--warn)" }} />
                <span className="tabular-nums">{driver.rating}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="-mb-px mt-5 flex gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                color: tab === t.id ? "var(--ink-1)" : "var(--ink-3)",
                borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`,
              }}
              className="cursor-pointer border-0 bg-transparent px-3.5 pb-3.5 pt-2.5 text-[13.5px] font-[550] -tracking-[0.005em] transition-colors duration-150"
            >
              {t.l}
            </button>
          ))}
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
            width: "min(960px, calc(100vw - 48px))",
            maxHeight: "calc(100vh - 48px)",
            display: "flex", flexDirection: "column",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            boxShadow: "var(--shadow-lg)",
          },
        },
        header: {
          style: {
            padding: 0,
            borderBottom: "1px solid var(--line)",
            borderRadius: "20px 20px 0 0",
            background: "transparent",
          },
        },
        headerTitle: { style: { width: "100%" } },
        content: {
          style: {
            flex: 1, overflow: "auto",
            padding: "22px 26px 26px",
            background: "var(--surface)",
            borderRadius: "0 0 20px 20px",
          },
        },
      }}
    >
      {tab === "apercu"      && <TabApercu      driver={driver} />}
      {tab === "competences" && <TabCompetences driver={driver} />}
      {tab === "planning"    && <TabPlanning    driver={driver} />}
      {tab === "historique"  && <TabHistorique  driver={driver} />}
    </Dialog>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: "var(--ink-3)" }} className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.4px]">
        {title}
      </div>
      <div className="grid gap-0.5">{children}</div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div
      style={{ borderBottom: "1px solid var(--line)" }}
      className="grid grid-cols-[130px_1fr] items-center gap-3 px-0.5 py-2.5"
    >
      <span style={{ color: "var(--ink-3)" }} className="inline-flex items-center gap-2 text-[12.5px]">
        <span style={{ color: "var(--ink-4)" }}>{icon}</span>
        {label}
      </span>
      <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">{value}</span>
    </div>
  );
}

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 90);
  const W = 260, H = 52;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * H;
    return [x, y] as const;
  });
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
  const area = path + ` L${W},${H} L0,${H} Z`;
  return (
    <svg width="100%" height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
      <path d={area} fill="var(--accent-soft)" />
      <path d={path} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.5 : 2} fill="var(--accent)" />
      ))}
      {data.map((v, i) => (
        <text key={i} x={pts[i][0]} y={H + 14} textAnchor="middle" fontSize="10" fill="var(--ink-4)" fontFamily="var(--font-mono)">
          {v}
        </text>
      ))}
    </svg>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TabApercu({ driver }: { driver: Driver }) {
  const daysUntilExpiry = Math.floor(
    (new Date(driver.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="grid grid-cols-[1.2fr_1fr] gap-[22px]">
      <div className="grid gap-4">
        <Section title="Contact">
          <Row label="Téléphone"       value={driver.phone}            icon={<Icon.phone size={13} />} />
          <Row label="E-mail"          value={driver.email}            icon={<Icon.mail size={13} />} />
          <Row label="Zones autorisées" value={driver.zones.join(", ")} icon={<Icon.globe size={13} />} />
        </Section>
        <Section title="Permis & habilitations">
          <Row label="Permis"     value={driver.license} icon={<Icon.license size={13} />} />
          <Row
            label="Expiration"
            icon={<Icon.calendar size={13} />}
            value={
              <span className="flex items-center gap-2">
                {new Date(driver.expiry).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                <span
                  style={{
                    background: daysUntilExpiry < 90 ? "var(--warn-soft)" : "var(--success-soft)",
                    color: daysUntilExpiry < 90 ? "var(--warn)" : "var(--success)",
                  }}
                  className="rounded-full px-2 py-[3px] text-[11px] font-semibold"
                >
                  {daysUntilExpiry < 90 ? `Renouveler dans ${daysUntilExpiry}j` : "À jour"}
                </span>
              </span>
            }
          />
        </Section>
      </div>

      <div className="grid gap-4">
        <div
          style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
          className="rounded-[16px] p-[18px]"
        >
          <div style={{ color: "var(--ink-3)" }} className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.4px]">
            Indicateurs 30 jours
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <KeyStat label="Missions"     value={driver.missions} />
            <KeyStat label="Ponctualité"  value={`${Math.round(driver.onTimeRate * 100)}%`} tone="good" />
            <KeyStat label="Note moyenne" value={driver.rating.toFixed(1)} />
            <KeyStat label="Incidents"    value={driver.incidents30d} tone={driver.incidents30d > 0 ? "bad" : "good"} />
          </div>
          <Hairline style={{ margin: "16px 0 14px" }} />
          <div style={{ color: "var(--ink-3)" }} className="mb-2.5 text-[12px]">Taux ponctualité — 6 derniers mois</div>
          <Spark data={[93, 95, 94, 96, 95, Math.round(driver.onTimeRate * 100)]} />
        </div>
        <Section title="Prochaine absence">
          <div style={{ color: "var(--ink-2)" }} className="flex items-center gap-2.5 px-0.5 py-2.5 text-[13.5px]">
            <Icon.calendar size={15} style={{ color: "var(--ink-4)" }} />
            {driver.nextLeave}
          </div>
        </Section>
      </div>
    </div>
  );
}

function TabCompetences({ driver }: { driver: Driver }) {
  const families = Array.from(new Set(SKILLS.map((s) => s.family)));

  return (
    <div className="grid gap-[22px]">
      <div
        style={{ background: "var(--accent-softer)", border: "1px solid var(--line)", color: "var(--ink-2)" }}
        className="flex items-start gap-3 rounded-[12px] p-4 text-[13px]"
      >
        <Icon.sparkle size={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
        <div>
          Les compétences déterminent l&apos;éligibilité du chauffeur au moment de l&apos;attribution automatique d&apos;une commande.
        </div>
      </div>

      {families.map((fam) => (
        <div key={fam}>
          <div style={{ color: "var(--ink-3)" }} className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.4px]">
            {fam}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {SKILLS.filter((s) => s.family === fam).map((s) => {
              const active = driver.skills.includes(s.id);
              return (
                <div
                  key={s.id}
                  style={{
                    border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                    background: active ? "var(--accent-soft)" : "var(--surface)",
                  }}
                  className="flex items-center gap-3 rounded-[11px] px-3.5 py-3"
                >
                  <div
                    style={{
                      border: `1.5px solid ${active ? "var(--accent)" : "var(--line-strong)"}`,
                      background: active ? "var(--accent)" : "transparent",
                    }}
                    className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] text-white"
                  >
                    {active && <Icon.check size={12} />}
                  </div>
                  <div className="flex-1">
                    <div style={{ color: active ? "var(--accent-ink)" : "var(--ink-1)" }} className="text-[13.5px] font-[550]">
                      {s.label}
                    </div>
                    <div style={{ color: "var(--ink-3)" }} className="mt-px text-[11.5px]">{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const DAYS = [
  { k: "mon", l: "Lun" }, { k: "tue", l: "Mar" }, { k: "wed", l: "Mer" },
  { k: "thu", l: "Jeu" }, { k: "fri", l: "Ven" }, { k: "sat", l: "Sam" }, { k: "sun", l: "Dim" },
] as const;

function TabPlanning({ driver }: { driver: Driver }) {
  return (
    <Section title="Disponibilités récurrentes">
      <div className="mt-2.5 flex gap-2">
        {DAYS.map((d) => {
          const av = driver.availability[d.k];
          return (
            <div
              key={d.k}
              style={{
                border: `1px solid ${av ? "var(--line-strong)" : "var(--line)"}`,
                background: av ? "var(--surface)" : "var(--surface-2)",
              }}
              className="flex-1 rounded-[10px] px-2.5 py-3 text-center"
            >
              <div style={{ color: "var(--ink-3)" }} className="text-[11px] font-semibold uppercase tracking-[0.4px]">
                {d.l}
              </div>
              <div
                style={{ color: av ? "var(--success)" : "var(--ink-4)" }}
                className="mt-1.5 text-[12.5px] font-[550]"
              >
                {av ? "08:00–18:00" : "Repos"}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function TabHistorique({ driver }: { driver: Driver }) {
  if (!driver.recent.length) {
    return (
      <div style={{ color: "var(--ink-3)" }} className="p-10 text-center text-[13px]">
        Aucune mission récente.
      </div>
    );
  }
  return (
    <Section title="Missions récentes">
      <div className="mt-2">
        {driver.recent.map((m) => (
          <div
            key={m.id}
            style={{ borderBottom: "1px solid var(--line)" }}
            className="grid grid-cols-[90px_70px_1fr_auto_auto] items-center gap-3.5 px-0.5 py-3 text-[13px]"
          >
            <div style={{ color: "var(--accent-ink)" }} className="font-mono">{m.id}</div>
            <div style={{ color: "var(--ink-3)" }}>{m.date}</div>
            <div style={{ color: "var(--ink-1)" }}>{m.route}</div>
            <div style={{ color: "var(--ink-3)" }} className="font-mono">{m.kms} km</div>
            <span
              style={{
                background: m.status === "Livrée" ? "var(--success-soft)" : "var(--accent-soft)",
                color: m.status === "Livrée" ? "var(--success)" : "var(--accent-ink)",
              }}
              className="rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold"
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}