"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Btn, Card, KeyStat, PageHeader, SearchInput, Segment } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { DriverCard, DriverList } from "@/components/chauffeurs/DriverCard";
import { DriverModal } from "@/components/chauffeurs/DriverModal";
import { CreateDrawer } from "@/components/chauffeurs/CreateDrawer";
import { SKILLS } from "@/lib/data";
import { listDrivers, createDriver } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import type { Driver, DriverStatus } from "@/lib/types";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | DriverStatus;
type SortKey = "name" | "rating" | "missions";

export default function ChauffeursPage() {
  const searchParams = useSearchParams();
  const { toast } = useApp();
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<ViewMode>("grid");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [skillFilter, setSkillFilter] = React.useState<string>("");
  const [sort, setSort] = React.useState<SortKey>("name");
  const [selected, setSelected] = React.useState<Driver | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const lastFocusedParam = React.useRef<string | null>(null);

  React.useEffect(() => {
    listDrivers().then((d) => { setDrivers(d); setLoading(false); });
  }, []);

  React.useEffect(() => {
    if (loading) return;
    const focus = searchParams.get("focus");
    if (!focus || focus === lastFocusedParam.current) return;

    const normalized = focus.trim().toLowerCase();
    const target = drivers.find((d) =>
      d.id.toLowerCase() === normalized || d.matricule.toLowerCase() === normalized,
    );

    lastFocusedParam.current = focus;
    if (target) setSelected(target);
  }, [drivers, loading, searchParams]);

  const filtered = React.useMemo(() => {
    let r = drivers;
    if (statusFilter !== "all") r = r.filter((d) => d.status === statusFilter);
    if (skillFilter) r = r.filter((d) => d.skills.includes(skillFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (d) =>
          `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
          d.matricule.toLowerCase().includes(q) ||
          d.vehicle.toLowerCase().includes(q),
      );
    }
    const sorters: Record<SortKey, (a: Driver, b: Driver) => number> = {
      name:     (a, b) => a.lastName.localeCompare(b.lastName),
      rating:   (a, b) => b.rating - a.rating,
      missions: (a, b) => b.missions - a.missions,
    };
    return [...r].sort(sorters[sort]);
  }, [drivers, statusFilter, skillFilter, search, sort]);

  const kpis = React.useMemo(() => ({
    total: drivers.length,
    service: drivers.filter((d) => d.status === "en-service").length,
    dispo: drivers.filter((d) => d.status === "disponible").length,
    conges: drivers.filter((d) => d.status === "conges").length,
    avgRating: drivers.length ? drivers.reduce((s, d) => s + d.rating, 0) / drivers.length : 0,
  }), [drivers]);

  const handleCreate = async (input: Omit<Driver, "id">) => {
    const created = await createDriver(input);
    setDrivers((prev) => [created, ...prev]);
    setDrawerOpen(false);
    toast(`${created.firstName} ${created.lastName} créé·e`, "success");
  };

  return (
    <>
      <PageHeader
        title="Chauffeurs"
        subtitle="Référentiel, compétences et disponibilités — UC-SUP-09"
      >
        <div className="flex items-center gap-2.5">
          <Btn variant="secondary" icon={<Icon.filter size={14}/>}>Exporter</Btn>
          <Btn variant="primary" icon={<Icon.plus size={14}/>} onClick={() => setDrawerOpen(true)}>
            Nouveau chauffeur
          </Btn>
        </div>
      </PageHeader>

      <Card style={{ marginTop: 24, padding: "20px 24px" }} pad={0}>
        <div className="grid grid-cols-5 gap-6">
          <KeyStat label="Effectif total" value={kpis.total} delta="+2 ce mois" tone="good"/>
          <KeyStat label="En service" value={kpis.service} tone="good"/>
          <KeyStat label="Disponibles" value={kpis.dispo}/>
          <KeyStat label="En congés" value={kpis.conges}/>
          <KeyStat label="Note moyenne" value={kpis.avgRating.toFixed(2)} tone="good"/>
        </div>
      </Card>

      <div className="mt-[22px] mb-[18px] flex flex-wrap items-center gap-3">
        <div className="min-w-[280px] flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher nom, matricule, véhicule…"/>
        </div>
        <Segment<StatusFilter>
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all",         label: "Tous" },
            { value: "en-service",  label: "En service" },
            { value: "disponible",  label: "Disponibles" },
            { value: "repos",       label: "Repos" },
            { value: "conges",      label: "Congés" },
          ]}
        />
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          style={{
            background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)",
          }}
          className="h-9 cursor-pointer rounded-[10px] px-2.5 text-[13px] outline-none"
        >
          <option value="">Toutes compétences</option>
          {SKILLS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{
            background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-2)",
          }}
          className="h-9 cursor-pointer rounded-[10px] px-2.5 text-[13px] outline-none"
        >
          <option value="name">Tri : nom</option>
          <option value="rating">Tri : note</option>
          <option value="missions">Tri : missions</option>
        </select>
        <Segment<ViewMode>
          value={view}
          onChange={setView}
          options={[
            { value: "grid", label: "Cartes" },
            { value: "list", label: "Tableau" },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ color: "var(--ink-3)" }} className="py-20 text-center text-[13px]">
          Chargement du référentiel…
        </div>
      ) : filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}>
          Aucun chauffeur ne correspond aux filtres.
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {filtered.map((d, i) => (
            <DriverCard key={d.id} driver={d} animIndex={i} onOpen={() => setSelected(d)}/>
          ))}
        </div>
      ) : (
        <DriverList drivers={filtered} onOpen={setSelected}/>
      )}

      {selected && (
        <DriverModal
          driver={selected}
          onClose={() => setSelected(null)}
          onToast={toast}
        />
      )}
      {drawerOpen && <CreateDrawer onClose={() => setDrawerOpen(false)} onCreate={handleCreate}/>}
    </>
  );
}
