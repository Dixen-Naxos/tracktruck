"use client";

import * as React from "react";
import { Btn, Card, KeyStat, PageHeader, SearchInput, Segment } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { ApiTrucks } from "@/lib/api";
import { TruckCard, FUEL_META } from "@/components/camions/TruckCard";
import { TruckDialog } from "@/components/camions/TruckDialog";
import { CreateTruckDialog } from "@/components/camions/CreateTruckDialog";
import type { FuelType, Truck } from "@/lib/types";

type FuelFilter = "all" | FuelType;

export default function CamionsPage() {
  const [trucks, setTrucks]         = React.useState<Truck[]>([]);
  const [loading, setLoading]       = React.useState(true);
  const [search, setSearch]         = React.useState("");
  const [fuelFilter, setFuelFilter] = React.useState<FuelFilter>("all");
  const [selected, setSelected]     = React.useState<Truck | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);

  React.useEffect(() => {
    ApiTrucks.list()
      .then(setTrucks)
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = React.useMemo(() => {
    let r = trucks;
    if (fuelFilter !== "all") r = r.filter((t) => t.fuelType === fuelFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((t) => t.plateNumber.toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => a.plateNumber.localeCompare(b.plateNumber));
  }, [trucks, search, fuelFilter]);

  const kpis = React.useMemo(() => ({
    total:      trucks.length,
    diesel:     trucks.filter((t) => t.fuelType === "diesel").length,
    essence:    trucks.filter((t) => t.fuelType === "essence").length,
    autre:      trucks.filter((t) => t.fuelType !== "diesel" && t.fuelType !== "essence").length,
    capTotale:  trucks.reduce((s, t) => s + t.packageCapacity, 0),
  }), [trucks]);

  const fuelOptions: { value: FuelFilter; label: string }[] = [
    { value: "all",        label: "Tous" },
    ...Object.entries(FUEL_META)
      .filter(([key]) => trucks.some((t) => t.fuelType === key))
      .map(([key, meta]) => ({ value: key as FuelType, label: meta.label })),
  ];

  return (
    <>
      <PageHeader title="Camions" subtitle="Référentiel de la flotte">
        <Btn variant="primary" icon={<Icon.plus size={14}/>} onClick={() => setCreateOpen(true)}>
          Ajouter un camion
        </Btn>
      </PageHeader>

      <Card style={{ marginTop: 24, padding: "20px 24px" }} pad={0}>
        <div className="grid grid-cols-5 gap-6">
          <KeyStat label="Total camions"    value={kpis.total}/>
          <KeyStat label="Diesel"           value={kpis.diesel}/>
          <KeyStat label="Essence"          value={kpis.essence}/>
          <KeyStat label="Autre carburant"  value={kpis.autre}/>
          <KeyStat label="Capacité totale"  value={`${kpis.capTotale} colis`}/>
        </div>
      </Card>

      <div className="mt-[22px] mb-[18px] flex flex-wrap items-center gap-3">
        <div className="min-w-[260px] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par immatriculation…"/>
        </div>
        <Segment<FuelFilter>
          value={fuelFilter}
          onChange={setFuelFilter}
          options={fuelOptions}
        />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)" }} className="py-20 text-center text-[13px]">
          Chargement de la flotte…
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}>
          Aucun camion ne correspond aux filtres.
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {filtered.map((truck, i) => (
            <TruckCard
              key={truck.id}
              truck={truck}
              animIndex={i}
              onOpen={() => setSelected(truck)}
            />
          ))}
        </div>
      )}

      {selected && <TruckDialog truck={selected} onClose={() => setSelected(null)}/>}

      {createOpen && (
        <CreateTruckDialog
          onClose={() => setCreateOpen(false)}
          onCreate={(truck) => {
            setTrucks((prev) => [truck, ...prev]);
            setCreateOpen(false);
          }}
        />
      )}
    </>
  );
}
