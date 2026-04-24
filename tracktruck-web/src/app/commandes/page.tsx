"use client";

import * as React from "react";
import { Card, KeyStat, PageHeader, SearchInput } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { ApiOrders } from "@/lib/api";
import { OrderCard } from "@/components/commandes/OrderCard";
import { OrderDialog } from "@/components/commandes/OrderDialog";
import type { Order } from "@/lib/types";

export default function CommandesPage() {
  const [orders, setOrders]         = React.useState<Order[]>([]);
  const [loading, setLoading]       = React.useState(true);
  const [search, setSearch]         = React.useState("");
  const [dateFrom, setDateFrom]     = React.useState("");
  const [dateTo, setDateTo]         = React.useState("");
  const [selected, setSelected]     = React.useState<Order | null>(null);

  React.useEffect(() => {
    ApiOrders.list()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    let r = orders;

    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (o) =>
          o.nomClient.toLowerCase().includes(q) ||
          o.produit.toLowerCase().includes(q) ||
          o.ville.toLowerCase().includes(q),
      );
    }

    if (dateFrom) {
      r = r.filter((o) => new Date(o.dateLivraisonVoulue) >= new Date(dateFrom));
    }
    if (dateTo) {
      r = r.filter((o) => new Date(o.dateLivraisonVoulue) <= new Date(dateTo));
    }

    return [...r].sort(
      (a, b) => new Date(a.dateLivraisonVoulue).getTime() - new Date(b.dateLivraisonVoulue).getTime(),
    );
  }, [orders, search, dateFrom, dateTo]);

  const [now] = React.useState(() => Date.now());

  const kpis = React.useMemo(() => ({
    total:  orders.length,
    retard: orders.filter((o) => new Date(o.dateLivraisonVoulue).getTime() < now).length,
    urgent: orders.filter((o) => {
      const d = Math.ceil((new Date(o.dateLivraisonVoulue).getTime() - now) / 86_400_000);
      return d >= 0 && d <= 3;
    }).length,
    aVenir: orders.filter((o) => new Date(o.dateLivraisonVoulue).getTime() > now).length,
  }), [orders, now]);

  const clearDates = () => { setDateFrom(""); setDateTo(""); };

  return (
    <>
      <PageHeader title="Commandes" subtitle="Suivi opérationnel des livraisons"/>

      <Card style={{ marginTop: 24, padding: "20px 24px" }} pad={0}>
        <div className="grid grid-cols-4 gap-6">
          <KeyStat label="Total commandes" value={kpis.total}/>
          <KeyStat label="À venir"         value={kpis.aVenir}  tone="good"/>
          <KeyStat label="Urgentes (≤ 3j)" value={kpis.urgent}  tone={kpis.urgent  > 0 ? "bad" : "good"}/>
          <KeyStat label="En retard"       value={kpis.retard}  tone={kpis.retard  > 0 ? "bad" : "good"}/>
        </div>
      </Card>

      <div className="mt-[22px] mb-[18px] flex flex-wrap items-center gap-3">
        <div className="min-w-[260px] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher client, produit, ville…"/>
        </div>

        <div className="flex items-center gap-2">
          <span style={{ color: "var(--ink-3)" }} className="text-[12.5px]">Livraison&nbsp;:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              height: 36, padding: "0 10px", borderRadius: 10, fontSize: 13,
              background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-1)",
              outline: "none",
            }}
          />
          <span style={{ color: "var(--ink-4)" }} className="text-[12px]">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              height: 36, padding: "0 10px", borderRadius: 10, fontSize: 13,
              background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-1)",
              outline: "none",
            }}
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={clearDates}
              style={{ color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer" }}
              aria-label="Effacer les dates"
            >
              <Icon.close size={14}/>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)" }} className="py-20 text-center text-[13px]">
          Chargement des commandes…
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}>
          Aucune commande ne correspond aux filtres.
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {filtered.map((order, i) => (
            <OrderCard
              key={order.id}
              order={order}
              animIndex={i}
              onOpen={() => setSelected(order)}
            />
          ))}
        </div>
      )}

      {selected && <OrderDialog order={selected} onClose={() => setSelected(null)}/>}
    </>
  );
}
