"use client";

import * as React from "react";
import { Icon } from "./icons";
import { Segment } from "./primitives";
import { useApp } from "@/context/AppContext";
import type { MapStyle, SidebarVariant, ThemeMode } from "@/lib/types";

export function TweaksPanel() {
  const { tweaks, setTweak, tweaksOpen, setTweaksOpen } = useApp();

  return (
    <>
      <button
        onClick={() => setTweaksOpen(!tweaksOpen)}
        style={{
          background: "var(--surface)", border: "1px solid var(--line-strong)",
          boxShadow: "var(--shadow-md)", color: "var(--ink-2)",
        }}
        className="fixed bottom-5 right-5 z-[59] inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full"
        aria-label="Ouvrir Tweaks"
      >
        <Icon.gear size={18}/>
      </button>

      {tweaksOpen && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line-strong)",
            boxShadow: "var(--shadow-lg)",
          }}
          className="tt-modal-in fixed bottom-20 right-5 z-[60] w-[300px] overflow-hidden rounded-2xl"
        >
          <div
            style={{ borderBottom: "1px solid var(--line)" }}
            className="flex items-center gap-2 px-4 py-3.5"
          >
            <Icon.gear size={15} style={{ color: "var(--accent)" }} />
            <span className="text-[14px] font-semibold -tracking-[0.01em]">Tweaks</span>
          </div>
          <div className="grid gap-4 p-4">
            <TweakGroup label="Thème">
              <Segment<ThemeMode>
                value={tweaks.theme}
                onChange={(v) => setTweak("theme", v)}
                options={[
                  { value: "light", label: "Clair", icon: <Icon.sun size={14}/> },
                  { value: "dark",  label: "Sombre", icon: <Icon.moon size={14}/> },
                ]}
              />
            </TweakGroup>
            <TweakGroup label="Carte">
              <Segment<MapStyle>
                value={tweaks.map}
                onChange={(v) => setTweak("map", v)}
                options={[
                  { value: "schematic", label: "Schématique" },
                  { value: "realistic", label: "Réaliste" },
                ]}
              />
            </TweakGroup>
            <TweakGroup label="Sidebar">
              <Segment<SidebarVariant>
                value={tweaks.sidebar}
                onChange={(v) => setTweak("sidebar", v)}
                options={[
                  { value: "expanded", label: "Étendue", icon: <Icon.sidebar size={14}/> },
                  { value: "compact",  label: "Icônes" },
                ]}
              />
            </TweakGroup>
          </div>
        </div>
      )}
    </>
  );
}

function TweakGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{ color: "var(--ink-3)" }}
        className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.4px]"
      >
        {label}
      </div>
      {children}
    </div>
  );
}
