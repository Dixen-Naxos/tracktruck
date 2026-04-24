"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { Avatar } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { clientTone, clientInitials, deliveryStatus } from "./OrderCard";
import type { Order } from "@/lib/types";

interface Props {
  order: Order;
  onClose: () => void;
}

export function OrderDialog({ order, onClose }: Props) {
  const tone    = clientTone(order.nomClient);
  const initials = clientInitials(order.nomClient);
  const status  = deliveryStatus(order.dateLivraisonVoulue);

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

      <div
        style={{
          background: `linear-gradient(135deg, oklch(0.97 0.025 ${tone}), var(--surface))`,
          padding: "22px 26px 20px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="flex items-center gap-4">
          <Avatar initials={initials} tone={tone} size={60} ring/>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="m-0 text-[22px] font-[650] -tracking-[0.02em]">
                {order.nomClient}
              </h2>
              <span
                style={{ background: status.bg, color: status.text }}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] font-semibold"
              >
                <Icon.calendar size={11}/>
                {status.label}
              </span>
            </div>
            <div style={{ color: "var(--ink-3)" }} className="mt-1.5 flex items-center gap-2 text-[13px]">
              <Icon.box size={13}/>
              <span className="font-[550]">{order.produit}</span>
              <span>·</span>
              <span>{order.quantite} unité{order.quantite > 1 ? "s" : ""}</span>
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
            width: "min(600px, calc(100vw - 48px))",
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
        <section>
          <SectionTitle>Détail de la commande</SectionTitle>
          <DetailCard>
            <DetailRow icon={<Icon.box size={14}/>} label="Produit">
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px] font-[550]">{order.produit}</span>
            </DetailRow>
            <DetailRow icon={<Icon.users size={14}/>} label="Quantité" last>
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px] tabular-nums font-semibold">
                {order.quantite} unité{order.quantite > 1 ? "s" : ""}
              </span>
            </DetailRow>
          </DetailCard>
        </section>

        <section>
          <SectionTitle>Adresse de livraison</SectionTitle>
          <DetailCard>
            <DetailRow icon={<Icon.pin size={14}/>} label="Rue">
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">{order.rue}</span>
            </DetailRow>
            <DetailRow icon={<Icon.map size={14}/>} label="Ville">
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">{order.codePostal} {order.ville}</span>
            </DetailRow>
            <DetailRow icon={<Icon.globe size={14}/>} label="Pays" last>
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">{order.pays}</span>
            </DetailRow>
          </DetailCard>
        </section>

        <section>
          <SectionTitle>Dates</SectionTitle>
          <DetailCard>
            <DetailRow icon={<Icon.calendar size={14}/>} label="Début commande">
              <span style={{ color: "var(--ink-1)" }} className="text-[13.5px]">
                {new Date(order.dateDebutCommande).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </DetailRow>
            <DetailRow icon={<Icon.clock size={14}/>} label="Livraison souhaitée" last>
              <span className="flex items-center gap-2 text-[13.5px]">
                <span style={{ color: "var(--ink-1)" }}>
                  {new Date(order.dateLivraisonVoulue).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span
                  style={{ background: status.bg, color: status.text }}
                  className="rounded-full px-2 py-[2px] text-[11px] font-semibold"
                >
                  {status.label}
                </span>
              </span>
            </DetailRow>
          </DetailCard>
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

function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12 }} className="grid gap-0">
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
      className="grid grid-cols-[140px_1fr] items-center gap-3 px-4 py-3"
    >
      <span style={{ color: "var(--ink-3)" }} className="inline-flex items-center gap-2 text-[12.5px]">
        <span style={{ color: "var(--ink-4)" }}>{icon}</span>
        {label}
      </span>
      {children}
    </div>
  );
}