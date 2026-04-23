"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { Avatar } from "./primitives";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  pulse?: boolean;
}

export function Sidebar() {
  const { tweaks } = useApp();
  const { signOut, user } = useAuth();

  const email = user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();
  const pathname = usePathname();
  const expanded = tweaks.sidebar === "expanded";
  const W = expanded ? 240 : 68;

  const nav: NavItem[] = [
    { id: "carte",        href: "/carte",        label: "Carte temps réel", icon: <Icon.map size={18}/>, count: 5 },
    { id: "chauffeurs",   href: "/chauffeurs",   label: "Chauffeurs",        icon: <Icon.users size={18}/>, count: 8 },
    { id: "commandes",    href: "/commandes",    label: "Commandes",         icon: <Icon.box size={18}/>, count: 42 },
    { id: "dashcam",      href: "/dashcam",      label: "Dashcam",           icon: <Icon.video size={18}/> },
    { id: "signalements", href: "/signalements", label: "Signalements",      icon: <Icon.alert size={18}/>, count: 2, pulse: true },
  ];

  return (
    <aside
      style={{
        width: W, background: "var(--surface)",
        borderRight: "1px solid var(--line)", height: "100vh",
        transition: "width .28s cubic-bezier(.2,.8,.2,1)",
      }}
      className="sticky top-0 flex shrink-0 flex-col overflow-hidden"
    >
      <div className={expanded ? "flex items-center gap-2.5 px-[18px] pt-[18px] pb-3.5" : "flex items-center justify-center px-3.5 pt-[18px] pb-3.5"}>
        <div
          style={{
            background: "linear-gradient(135deg, var(--accent), oklch(0.48 0.2 280))",
            boxShadow: "0 3px 10px color-mix(in oklab, var(--accent) 40%, transparent)",
          }}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
            <path d="M3 15V7h10v8M13 11h4l3 3v1"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        {expanded && (
          <div className="min-w-0">
            <div className="text-[15px] font-[650] -tracking-[0.02em]">TrackTruck</div>
            <div style={{ color: "var(--ink-3)" }} className="mt-px text-[11.5px]">Supervision · v1.0</div>
          </div>
        )}
      </div>

      <nav className={(expanded ? "px-2.5" : "px-2") + " mt-3 flex flex-col gap-[2px]"}>
        {nav.map((n) => {
          const isActive = pathname === n.href;
          return (
            <Link
              key={n.id}
              href={n.href}
              title={!expanded ? n.label : undefined}
              style={{
                background: isActive ? "var(--accent-soft)" : "transparent",
                color: isActive ? "var(--accent-ink)" : "var(--ink-2)",
                fontWeight: isActive ? 600 : 500,
                padding: expanded ? "8px 10px" : "10px",
                justifyContent: expanded ? "flex-start" : "center",
              }}
              className="relative flex items-center gap-2.5 rounded-[9px] text-[13.5px] -tracking-[0.003em] no-underline transition-colors duration-150 hover:bg-[var(--surface-2)]"
            >
              <span className="relative inline-flex">
                {n.icon}
                {n.pulse && (
                  <span
                    style={{ background: "var(--danger)", boxShadow: "0 0 0 2px var(--surface)" }}
                    className="absolute -top-[2px] -right-[3px] h-[7px] w-[7px] rounded-full"
                  />
                )}
              </span>
              {expanded && (
                <>
                  <span className="flex-1 text-left">{n.label}</span>
                  {n.count != null && (
                    <span
                      style={{
                        background: isActive ? "rgba(255,255,255,0.6)" : "var(--surface-2)",
                        color: isActive ? "var(--accent-ink)" : "var(--ink-3)",
                        border: "1px solid var(--line)",
                      }}
                      className="rounded-full px-[7px] py-[2px] text-[11px] font-semibold tabular-nums"
                    >
                      {n.count}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div style={{ borderTop: "1px solid var(--line)" }} className={expanded ? "p-3" : "p-2.5"}>
        <div className={expanded ? "flex items-center gap-2.5 rounded-[10px] p-2" : "flex items-center justify-center rounded-[10px] py-1"}>
          <Avatar initials={initials} tone={25} size={34}/>
          {expanded && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold -tracking-[0.005em]">{email}</div>
                <div style={{ color: "var(--ink-3)" }} className="text-[11.5px]">Administrateur</div>
              </div>
              <button
                onClick={() => void signOut()}
                style={{ color: "var(--ink-4)" }}
                className="cursor-pointer border-0 bg-transparent p-1"
                aria-label="Déconnexion"
              >
                <Icon.logout size={16}/>
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
