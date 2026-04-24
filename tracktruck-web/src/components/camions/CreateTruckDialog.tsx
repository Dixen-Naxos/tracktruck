"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import type { FuelType, Truck } from "@/lib/types";
import { ApiTrucks } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const FUEL_OPTIONS: { label: string; value: FuelType }[] = [
  { label: "Diesel",     value: "diesel"     },
  { label: "Essence",    value: "essence"    },
  { label: "Électrique", value: "electrique" },
  { label: "Hybride",    value: "hybride"    },
  { label: "GPL",        value: "gpl"        },
];

const INPUT_PT = {
  root: {
    style: {
      width: "100%", height: 36, borderRadius: 9, padding: "0 12px",
      fontSize: 13.5, color: "var(--ink-1)",
      background: "var(--surface-2)", border: "1px solid var(--line-strong)",
      outline: "none", boxSizing: "border-box" as const,
    },
  },
};

interface Props {
  onClose: () => void;
  onCreate: (truck: Truck) => void;
}

export function CreateTruckDialog({ onClose, onCreate }: Props) {
  const { toast } = useApp();
  const [plateNumber,          setPlateNumber]          = React.useState("");
  const [packageCapacity,      setPackageCapacity]      = React.useState<number | null>(null);
  const [fuelType,             setFuelType]             = React.useState<FuelType>("diesel");
  const [fuelConsumption,      setFuelConsumption]      = React.useState<number | null>(null);
  const [saving,               setSaving]               = React.useState(false);

  const canSave = !!(plateNumber.trim() && packageCapacity && packageCapacity > 0 && fuelConsumption && fuelConsumption > 0);

  const save = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const created = await ApiTrucks.create({
        plateNumber:           plateNumber.trim().toUpperCase(),
        packageCapacity:       packageCapacity!,
        fuelType,
        fuelConsumptionL100km: fuelConsumption!,
      });
      onCreate(created);
      toast(`Camion ${created.plateNumber} créé`, "success");
    } catch {
      toast("Erreur lors de la création", "warn");
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <div>
      <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: "-0.02em", color: "var(--ink-1)" }}>
        Ajouter un camion
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
        Enregistrer un nouveau véhicule dans la flotte
      </div>
    </div>
  );

  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
      <Button
        label="Annuler"
        onClick={onClose}
        pt={{
          root: {
            style: {
              height: 34, padding: "0 14px", fontSize: 13.5, fontWeight: 550,
              borderRadius: 10, border: "none", cursor: "pointer",
              background: "transparent", color: "var(--ink-2)",
            },
          },
        }}
      />
      <Button
        label={saving ? "Création…" : "Créer le camion"}
        disabled={!canSave || saving}
        onClick={save}
        pt={{
          root: {
            style: {
              height: 34, padding: "0 14px", fontSize: 13.5, fontWeight: 550,
              borderRadius: 10, border: "none",
              cursor: canSave && !saving ? "pointer" : "not-allowed",
              background: "var(--accent)", color: "#fff",
              opacity: canSave && !saving ? 1 : 0.5,
            },
          },
        }}
      />
    </div>
  );

  return (
    <Dialog
      visible
      modal
      draggable={false}
      resizable={false}
      onHide={onClose}
      header={header}
      footer={footer}
      pt={{
        mask: {
          style: {
            position: "fixed", inset: 0, zIndex: 60,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(15,17,28,0.35)", backdropFilter: "blur(8px)",
          },
        },
        root: {
          style: {
            width: "min(480px, calc(100vw - 32px))",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            boxShadow: "var(--shadow-lg)",
          },
        },
        header: {
          style: {
            padding: "20px 24px", borderBottom: "1px solid var(--line)",
            background: "var(--surface)", borderRadius: "16px 16px 0 0",
          },
        },
        closeButton: {
          style: {
            width: 32, height: 32, borderRadius: 8,
            background: "var(--surface-2)", border: "none",
            cursor: "pointer", color: "var(--ink-3)",
          },
        },
        content: {
          style: {
            padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18,
            background: "var(--surface)",
          },
        },
        footer: {
          style: {
            padding: "14px 24px 20px", borderTop: "1px solid var(--line)",
            background: "var(--surface)", borderRadius: "0 0 16px 16px",
          },
        },
      }}
    >
      <Field label="Immatriculation" required>
        <InputText
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          placeholder="AB-123-CD"
          pt={INPUT_PT}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Capacité (colis)" required>
          <InputNumber
            value={packageCapacity}
            onValueChange={(e) => setPackageCapacity(e.value ?? null)}
            min={1}
            placeholder="120"
            pt={{
              root: { style: { width: "100%" } },
              input: INPUT_PT,
            }}
          />
        </Field>
        <Field label="Conso. (L/100km)" required>
          <InputNumber
            value={fuelConsumption}
            onValueChange={(e) => setFuelConsumption(e.value ?? null)}
            min={0.1}
            minFractionDigits={1}
            maxFractionDigits={1}
            placeholder="28.5"
            pt={{
              root: { style: { width: "100%" } },
              input: INPUT_PT,
            }}
          />
        </Field>
      </div>

      <Field label="Type de carburant" required>
        <SelectButton
          value={fuelType}
          onChange={(e) => setFuelType(e.value as FuelType)}
          options={FUEL_OPTIONS}
          optionLabel="label"
          optionValue="value"
          pt={{
            root: { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
            button: ({ context }: { context: { selected: boolean } }) => ({
              style: {
                border: `1px solid ${context.selected ? "var(--accent)" : "var(--line)"}`,
                background: context.selected ? "var(--accent-soft)" : "transparent",
                color: context.selected ? "var(--accent-ink)" : "var(--ink-2)",
                borderRadius: 7, padding: "5px 12px",
                fontSize: 12.5, fontWeight: 500,
                cursor: "pointer", userSelect: "none",
                transition: "all .15s",
              },
            }),
            label: { style: { fontWeight: "inherit", fontSize: "inherit" } },
          }}
        />
      </Field>
    </Dialog>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <div style={{
        color: "var(--ink-3)", fontSize: 12, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 6,
      }}>
        {label}{required && <span style={{ color: "var(--danger)", marginLeft: 4 }}>*</span>}
      </div>
      {children}
    </div>
  );
}
