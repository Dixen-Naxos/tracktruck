"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Btn,
  Card,
  KeyStat,
  PageHeader,
  SearchInput,
  Segment,
} from "@/components/primitives";
import { Icon } from "@/components/icons";
import { DriverCard, DriverList } from "@/components/chauffeurs/DriverCard";
import { CreateChauffeur } from "@/components/chauffeurs/CreateChauffeur";
import { DriverDialog } from "@/components/chauffeurs/DriverDialog";
import { SKILLS } from "@/lib/data";
import { ApiDrivers } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import type { Driver, DriverStatus, DriverUser } from "@/lib/types";
import { useEffect } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

type ViewMode = "grid" | "list";
type SortKey = "name";

export default function ChauffeursPage() {
  const { toast } = useApp();
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<ViewMode>("grid");
  const [search, setSearch] = React.useState("");
  const [skillFilter, setSkillFilter] = React.useState<string>("");
  const [sort, setSort] = React.useState<SortKey>("name");
  const [selected, setSelected] = React.useState<Driver | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  useEffect(() => {
    ApiDrivers.list().then((d) => {
      setDrivers(d);
      setLoading(false);
    });
  }, []);

  const filtered = React.useMemo(() => {
    let r = drivers;
    if (skillFilter) r = r.filter((d) => d.skills.includes(skillFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((d) =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q),
      );
    }
    const sorters: Record<SortKey, (a: Driver, b: Driver) => number> = {
      name: (a, b) => a.lastName.localeCompare(b.lastName),
    };
    return [...r].sort(sorters[sort]);
  }, [drivers, skillFilter, search, sort]);

  const handleCreate = async (input: DriverUser) => {
    const created = await ApiDrivers.createUser(input);
    sendPasswordResetEmail(auth, created.email);
    setDrivers((prev) => [created, ...prev]);
    setDrawerOpen(false);
    toast(`${created.firstName} ${created.lastName} créé·e`, "success");
  };

  const handleUpdate = (updated: Driver) => {
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setSelected(updated);
  };

  return (
    <>
      <PageHeader
        title="Chauffeurs"
        subtitle="Référentiel, compétences et disponibilités"
      >
        <div className="flex items-center gap-2.5">
          <Btn
            variant="primary"
            icon={<Icon.plus size={14} />}
            onClick={() => setDrawerOpen(true)}
          >
            Crée un chauffeur
          </Btn>
        </div>
      </PageHeader>

      <div className="mt-[22px] mb-[18px] flex flex-wrap items-center gap-3">
        <div className="min-w-[280px] flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher nom, matricule, véhicule…"
          />
        </div>
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            color: "var(--ink-2)",
          }}
          className="h-9 cursor-pointer rounded-[10px] px-2.5 text-[13px] outline-none"
        >
          <option value="">Toutes compétences</option>
          {SKILLS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            color: "var(--ink-2)",
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
        <div
          style={{ color: "var(--ink-3)" }}
          className="py-20 text-center text-[13px]"
        >
          Chargement du référentiel…
        </div>
      ) : filtered.length === 0 ? (
        <Card
          style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}
        >
          Aucun chauffeur ne correspond aux filtres.
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
          {filtered.map((d, i) => (
            <DriverCard
              key={d.id}
              driver={d}
              animIndex={i}
              onOpen={() => setSelected(d)}
            />
          ))}
        </div>
      ) : (
        <DriverList drivers={filtered} onOpen={setSelected} />
      )}

      {selected && (
        <DriverDialog
          driver={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
      {drawerOpen && (
        <CreateChauffeur
          onClose={() => setDrawerOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
