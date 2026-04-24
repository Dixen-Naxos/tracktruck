"use client";

import * as React from "react";
import { Avatar, Hairline } from "@/components/primitives";
import { Icon } from "@/components/icons";
import type { Order } from "@/lib/types";

export function clientTone(name: string): number {
  return name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
}

export function clientInitials(name: string): string {
  return name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function deliveryStatus(dateLivraisonVoulue: string): { label: string; bg: string; text: string } {
  const days = Math.ceil((new Date(dateLivraisonVoulue).getTime() - Date.now()) / 86_400_000);
  if (days < 0)  return { label: "En retard",          bg: "var(--danger-soft)", text: "var(--danger)"     };
  if (days === 0) return { label: "Aujourd'hui",        bg: "var(--warn-soft)",   text: "var(--warn)"       };
  if (days <= 3) return { label: `Dans ${days}j`,      bg: "var(--warn-soft)",   text: "var(--warn)"       };
  return               { label: `Dans ${days}j`,      bg: "var(--accent-softer)", text: "var(--accent-ink)" };
}

export function OrderCard({
  order, animIndex = 0, onOpen,
}: { order: Order; animIndex?: number; onOpen: () => void }) {
  const tone    = clientTone(order.nomClient);
  const initials = clientInitials(order.nomClient);
  const status  = deliveryStatus(order.dateLivraisonVoulue);

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
        <Avatar initials={initials} tone={tone} size={52}/>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[16px] font-semibold -tracking-[0.015em] truncate">
              {order.nomClient}
            </span>
            <span
              style={{ background: status.bg, color: status.text, flexShrink: 0 }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold"
            >
              <Icon.calendar size={10}/>
              {status.label}
            </span>
          </div>
          <div style={{ color: "var(--ink-3)" }} className="mt-0.5 flex items-center gap-1.5 text-[12.5px]">
            <Icon.box size={12}/>
            <span className="truncate">{order.produit}</span>
            <span>·</span>
            <span className="font-semibold tabular-nums">{order.quantite}</span>
          </div>
        </div>
      </div>

      <div style={{ color: "var(--ink-2)" }} className="mt-4 grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-[7px] text-[12.5px]">
        <Icon.pin      size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/>
        <span className="truncate">{order.rue}, {order.codePostal} {order.ville}</span>
        <Icon.calendar size={14} style={{ color: "var(--ink-4)", marginTop: 1 }}/>
        <span>
          Livraison souhaitée le{" "}
          <span style={{ color: "var(--ink-1)" }} className="font-[550]">
            {new Date(order.dateLivraisonVoulue).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </span>
      </div>

      <Hairline style={{ margin: "14px 0 10px" }}/>

      <div className="flex items-center justify-between text-[12px]">
        <span style={{ color: "var(--ink-4)" }}>
          Commande du{" "}
          {new Date(order.dateDebutCommande).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span style={{ color: "var(--accent-ink)" }} className="inline-flex items-center gap-1 font-[550]">
          Voir le détail <Icon.chevronR size={12}/>
        </span>
      </div>
    </div>
  );
}