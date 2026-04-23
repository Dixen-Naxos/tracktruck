"use client";

import * as React from "react";
import { Icon } from "./icons";
import type { DriverStatus, ToastKind } from "@/lib/types";
import { STATUS_META } from "@/lib/data";

// ─── Avatar ──────────────────────────────────────────────────────────────────

export function Avatar({
  initials, tone = 220, size = 44, ring = false,
}: { initials: string; tone?: number; size?: number; ring?: boolean }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.32,
        background: `linear-gradient(135deg, oklch(0.93 0.035 ${tone}), oklch(0.97 0.02 ${tone}))`,
        color: `oklch(0.35 0.12 ${tone})`,
        fontSize: size * 0.38,
        boxShadow: ring ? "0 0 0 3px var(--accent-soft)" : "inset 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      className="inline-flex shrink-0 items-center justify-center font-semibold -tracking-[0.02em]"
    >
      {initials}
    </div>
  );
}

// ─── StatusDot / StatusPill ───────────────────────────────────────────────────

export function StatusDot({
  color, size = 8, pulse = false,
}: { color: string; size?: number; pulse?: boolean }) {
  return (
    <span
      style={{ width: size, height: size, background: color }}
      className={"inline-block shrink-0 rounded-full " + (pulse ? "tt-pulse" : "")}
    />
  );
}

export function StatusPill({ status }: { status: DriverStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      style={{ background: m.bg, color: m.text }}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[12px] font-[550] -tracking-[0.005em]"
    >
      <StatusDot color={m.dot} />
      {m.label}
    </span>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
type BtnSize    = "sm" | "md" | "lg";

const BTN_SIZES: Record<BtnSize, { h: number; px: number; fs: number }> = {
  sm: { h: 28, px: 12, fs: 13   },
  md: { h: 34, px: 14, fs: 13.5 },
  lg: { h: 40, px: 18, fs: 14.5 },
};

const BTN_VARIANTS: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: "var(--accent)",       color: "#fff",           boxShadow: "0 1px 2px rgba(17,20,45,0.08), inset 0 1px 0 rgba(255,255,255,0.15)" },
  secondary: { background: "var(--surface)",      color: "var(--ink-1)",   borderColor: "var(--line-strong)", boxShadow: "var(--shadow-sm)" },
  ghost:     { background: "transparent",         color: "var(--ink-2)"   },
  soft:      { background: "var(--accent-soft)",  color: "var(--accent-ink)" },
  danger:    { background: "var(--danger-soft)",  color: "var(--danger)"  },
};

export function Btn({
  variant = "primary", size = "md", icon, children, style, className = "", disabled, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant; size?: BtnSize; icon?: React.ReactNode;
}) {
  const s = BTN_SIZES[size];
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs,
        borderRadius: 10, border: "1px solid transparent",
        opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto",
        ...BTN_VARIANTS[variant], ...style,
      }}
      className={
        "inline-flex items-center gap-2 font-[550] -tracking-[0.005em] cursor-pointer select-none " +
        "transition-[transform,background,box-shadow] duration-150 active:scale-[0.98] " + className
      }
    >
      {icon}{children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children, style, pad = 24, className = "", ...rest
}: React.HTMLAttributes<HTMLDivElement> & { pad?: number }) {
  return (
    <div
      {...rest}
      style={{
        background: "var(--surface)", border: "1px solid var(--line)",
        borderRadius: 16, padding: pad, boxShadow: "var(--shadow-sm)",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ─── Hairline ─────────────────────────────────────────────────────────────────

export function Hairline({
  vertical, style,
}: { vertical?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--line)",
        ...(vertical ? { width: 1, alignSelf: "stretch" } : { height: 1, width: "100%" }),
        ...style,
      }}
    />
  );
}

// ─── Kbd ──────────────────────────────────────────────────────────────────────

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)", borderColor: "var(--line-strong)",
        color: "var(--ink-3)", background: "var(--surface-2)",
      }}
      className="rounded-[5px] border px-1.5 py-[2px] text-[11px]"
    >
      {children}
    </span>
  );
}

// ─── SkillTag ─────────────────────────────────────────────────────────────────

const SKILL_TAG_PALETTE = {
  default: { bg: "var(--surface-2)",   fg: "var(--ink-2)",      bd: "var(--line)"    },
  accent:  { bg: "var(--accent-soft)", fg: "var(--accent-ink)", bd: "transparent"    },
  warn:    { bg: "var(--warn-soft)",   fg: "var(--warn)",       bd: "transparent"    },
};

export function SkillTag({
  label, variant = "default",
}: { label: string; variant?: keyof typeof SKILL_TAG_PALETTE }) {
  const p = SKILL_TAG_PALETTE[variant];
  return (
    <span
      style={{ background: p.bg, color: p.fg, borderColor: p.bd }}
      className="inline-flex items-center gap-1 rounded-[7px] border px-2.5 py-1 text-[12px] font-medium"
    >
      {label}
    </span>
  );
}

// ─── Segment ──────────────────────────────────────────────────────────────────

export function Segment<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
      className="inline-flex rounded-[10px] p-[3px]"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              background: active ? "var(--surface)" : "transparent",
              color:      active ? "var(--ink-1)"  : "var(--ink-3)",
              boxShadow:  active ? "var(--shadow-sm)" : "none",
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 px-3 py-1.5 text-[13px] font-medium transition-all duration-150"
          >
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

export function SearchInput({
  value, onChange, placeholder = "Rechercher", shortcutLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  shortcutLabel?: string;
}) {
  return (
    <label
      style={{ background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-3)" }}
      className="inline-flex h-18 w-full items-center gap-2 rounded-[10px] px-3"
    >
      <Icon.search size={32} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ color: "var(--ink-1)" }}
        className="w-full border-0 bg-transparent text-[13.5px] outline-none"
      />
      {shortcutLabel ? <Kbd>{shortcutLabel}</Kbd> : null}
    </label>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

const TOAST_PALETTE: Record<ToastKind, { ic: string }> = {
  info:    { ic: "var(--accent)"  },
  success: { ic: "var(--success)" },
  warn:    { ic: "var(--warn)"    },
};

export function Toast({
  kind = "info", children, onClose,
}: { kind?: ToastKind; children: React.ReactNode; onClose?: () => void }) {
  const { ic } = TOAST_PALETTE[kind];
  return (
    <div
      style={{
        background: "var(--surface)", border: "1px solid var(--line-strong)",
        boxShadow: "var(--shadow-lg)",
      }}
      className="tt-toast-in flex min-w-[280px] items-center gap-3 rounded-xl py-2.5 pl-3 pr-3.5"
    >
      <span
        style={{
          background: `color-mix(in oklab, ${ic} 14%, transparent)`,
          color: ic,
        }}
        className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full"
      >
        <Icon.check size={14} />
      </span>
      <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">{children}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ color: "var(--ink-4)" }}
          className="ml-2 cursor-pointer border-0 bg-transparent p-1"
        >
          <Icon.close size={14} />
        </button>
      )}
    </div>
  );
}

// ─── KeyStat ──────────────────────────────────────────────────────────────────

export function KeyStat({
  label, value, delta, tone = "neutral",
}: {
  label: string; value: React.ReactNode;
  delta?: string; tone?: "neutral" | "good" | "bad";
}) {
  const color = tone === "good" ? "var(--success)" : tone === "bad" ? "var(--danger)" : "var(--ink-3)";
  return (
    <div>
      <div style={{ color: "var(--ink-3)" }} className="text-[11.5px] font-medium uppercase tracking-[0.2px]">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-[22px] font-semibold -tracking-[0.02em]">{value}</span>
        {delta && <span style={{ color }} className="text-[12px] font-medium">{delta}</span>}
      </div>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, children,
}: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-5">
      <div>
        <h1 className="m-0 text-[26px] font-[650] -tracking-[0.025em]">{title}</h1>
        {subtitle && (
          <div style={{ color: "var(--ink-3)" }} className="mt-1 text-[14px]">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}