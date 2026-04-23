import * as React from "react";
import { Avatar, Card, Hairline, SkillTag, StatusPill } from "../primitives";
import { Icon } from "../icons";
import { SKILLS } from "@/lib/data";
import type { Driver } from "@/lib/types";

const LIST_COLS = "grid-cols-[2fr_1.2fr_0.8fr_1.4fr_0.8fr_0.6fr_40px]";

export function DriverCard({
  driver, onOpen, animIndex = 0,
}: { driver: Driver; onOpen: () => void; animIndex?: number }) {
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
        <Avatar initials={driver.initials} tone={driver.avatarTone} size={52}/>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold -tracking-[0.015em]">
                  {driver.firstName} {driver.lastName}
                </span>
                {driver.rating >= 4.9 && <Icon.sparkle size={14} style={{ color: "var(--warn)" }}/>}
              </div>
              <div style={{ color: "var(--ink-3)" }} className="mt-px font-mono text-[12.5px]">{driver.matricule}</div>
            </div>
            <div style={{ color: "var(--warn)" }} className="flex items-center gap-1">
              <Icon.star size={12} style={{ fill: "currentColor" }}/>
              <span style={{ color: "var(--ink-1)" }} className="text-[13px] font-semibold tabular-nums">{driver.rating}</span>
            </div>
          </div>
          <div className="mt-2">
            <StatusPill status={driver.status}/>
          </div>
        </div>
      </div>

      <div style={{ color: "var(--ink-2)" }} className="mt-4 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-[7px] text-[12.5px]">
        <Icon.phone size={14} style={{ color: "var(--ink-4)" }}/> <span>{driver.phone}</span>
        <Icon.truck size={14} style={{ color: "var(--ink-4)" }}/>
        <span>Véhicule <span style={{ color: "var(--ink-1)" }} className="font-mono">{driver.vehicle}</span></span>
        <Icon.pin size={14} style={{ color: "var(--ink-4)" }}/> <span>{driver.zones.slice(0, 2).join(" · ")}</span>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {driver.skills.slice(0, 4).map((sid) => {
          const s = SKILLS.find((x) => x.id === sid);
          return <SkillTag key={sid} label={s?.label ?? sid}/>;
        })}
        {driver.skills.length > 4 && <SkillTag label={`+${driver.skills.length - 4}`}/>}
      </div>

      <Hairline style={{ margin: "16px 0 12px" }}/>

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <Metric label="Missions" value={driver.missions}/>
          <Metric label="Ponctualité" value={`${Math.round(driver.onTimeRate * 100)}%`}/>
        </div>
        <span style={{ color: "var(--accent-ink)" }} className="inline-flex items-center gap-1 text-[12px] font-[550]">
          Voir la fiche <Icon.chevronR size={12}/>
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: "var(--ink-4)" }} className="text-[10.5px] font-medium uppercase tracking-[0.3px]">{label}</div>
      <div style={{ color: "var(--ink-1)" }} className="text-[14px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function DriverList({
  drivers, onOpen,
}: { drivers: Driver[]; onOpen: (d: Driver) => void }) {
  return (
    <Card pad={0}>
      <div
        style={{ borderBottom: "1px solid var(--line)", color: "var(--ink-3)" }}
        className={`grid ${LIST_COLS} gap-3.5 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.4px]`}
      >
        <div>Chauffeur</div><div>Statut</div><div>Véhicule</div><div>Compétences</div><div>Missions</div><div>Note</div><div/>
      </div>
      {drivers.map((d, i) => (
        <div
          key={d.id}
          onClick={() => onOpen(d)}
          className={`tt-row-in grid cursor-pointer ${LIST_COLS} items-center gap-3.5 px-5 py-3.5 text-[13px] transition-colors duration-150 hover:bg-[var(--surface-2)]`}
          style={{ borderBottom: "1px solid var(--line)", animationDelay: `${Math.min(i * 25, 300)}ms` }}
        >
          <div className="flex items-center gap-3">
            <Avatar initials={d.initials} tone={d.avatarTone} size={36}/>
            <div>
              <div className="text-[13.5px] font-semibold">{d.firstName} {d.lastName}</div>
              <div style={{ color: "var(--ink-3)" }} className="font-mono text-[11.5px]">{d.matricule}</div>
            </div>
          </div>
          <div><StatusPill status={d.status}/></div>
          <div style={{ color: "var(--ink-2)" }} className="font-mono">{d.vehicle}</div>
          <div className="flex flex-wrap gap-1">
            {d.skills.slice(0, 3).map((sid) => {
              const s = SKILLS.find((x) => x.id === sid);
              return <SkillTag key={sid} label={s?.label ?? sid}/>;
            })}
            {d.skills.length > 3 && <SkillTag label={`+${d.skills.length - 3}`}/>}
          </div>
          <div className="tabular-nums">{d.missions}</div>
          <div style={{ color: "var(--warn)" }} className="flex items-center gap-0.5 font-semibold">
            <Icon.star size={12} style={{ fill: "currentColor" }}/>
            <span style={{ color: "var(--ink-1)" }}>{d.rating}</span>
          </div>
          <div style={{ color: "var(--ink-4)" }}><Icon.chevronR size={16}/></div>
        </div>
      ))}
    </Card>
  );
}