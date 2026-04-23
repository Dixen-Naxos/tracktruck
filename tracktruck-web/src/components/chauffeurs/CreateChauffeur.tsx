"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Chips } from "primereact/chips";
import { SelectButton } from "primereact/selectbutton";
import { Button } from "primereact/button";
import { SKILLS } from "@/lib/data";
import type { DriverUser } from "@/lib/types";

interface Props {
  onClose: () => void;
  onCreate: (input: DriverUser) => void;
}

const SKILL_OPTIONS = SKILLS.map((s) => ({ label: s.label, value: s.id }));

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

export const CreateChauffeur = ({ onClose, onCreate }: Props) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName,  setLastName]  = React.useState("");
  const [email,     setEmail]     = React.useState("");
  const [phone,     setPhone]     = React.useState("");
  const [zones,     setZones]     = React.useState<string[]>([]);
  const [skills,    setSkills]    = React.useState<string[]>([]);

  const canSubmit = !!(firstName.trim() && lastName.trim());

  const submit = () => {
    if (!canSubmit) return;
    onCreate({
      role:      "driver",
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      email,
      phone,
      skills,
      zones,
    });
  };

  const header = (
    <div>
      <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: "-0.02em", color: "var(--ink-1)" }}>
        Créer un chauffeur
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>
        Ajoutez un profil au référentiel
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
        label="Créer le chauffeur"
        disabled={!canSubmit}
        onClick={submit}
        pt={{
          root: {
            style: {
              height: 34, padding: "0 14px", fontSize: 13.5, fontWeight: 550,
              borderRadius: 10, border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
              background: "var(--accent)", color: "#fff",
              opacity: canSubmit ? 1 : 0.5,
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
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(15,17,28,0.35)", backdropFilter: "blur(8px)",
          },
        },
        root: {
          style: {
            width: "min(520px, calc(100vw - 32px))",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            boxShadow: "var(--shadow-lg)",
          },
        },
        header: {
          style: {
            padding: "20px 24px",
            borderBottom: "1px solid var(--line)",
            background: "var(--surface)",
            borderRadius: "16px 16px 0 0",
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
            padding: "20px 24px",
            display: "flex", flexDirection: "column", gap: 18,
            background: "var(--surface)",
          },
        },
        footer: {
          style: {
            padding: "14px 24px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            borderRadius: "0 0 16px 16px",
          },
        },
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Prénom" required>
          <InputText
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            pt={INPUT_PT}
          />
        </Field>
        <Field label="Nom" required>
          <InputText
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            pt={INPUT_PT}
          />
        </Field>
      </div>

      <Field label="E-mail">
        <InputText
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="prenom.nom@tracktruck.fr"
          pt={INPUT_PT}
        />
      </Field>

      <Field label="Téléphone">
        <InputText
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33 …"
          pt={INPUT_PT}
        />
      </Field>

      <Field label="Zones">
        <Chips
          value={zones}
          onChange={(e) => setZones(e.value ?? [])}
          placeholder="Saisir puis Entrée"
          pt={{
            root: { style: { width: "100%" } },
            container: {
              style: {
                width: "100%", minHeight: 36, flexWrap: "wrap", gap: 4,
                borderRadius: 9, padding: "4px 8px",
                background: "var(--surface-2)", border: "1px solid var(--line-strong)",
                listStyle: "none", margin: 0, display: "flex", alignItems: "center",
              },
            },
            token: {
              style: {
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "var(--accent-soft)", color: "var(--accent-ink)",
                borderRadius: 7, padding: "2px 8px",
                fontSize: 12, fontWeight: 500,
              },
            },
            input: {
              style: {
                border: "none", outline: "none",
                background: "transparent", color: "var(--ink-1)",
                fontSize: 13.5, minWidth: 120,
              },
            },
          }}
        />
      </Field>

      <Field label="Compétences">
        <SelectButton
          value={skills}
          onChange={(e) => setSkills(e.value ?? [])}
          options={SKILL_OPTIONS}
          optionLabel="label"
          optionValue="value"
          multiple
          pt={{
            root: { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
            button: ({ context }: { context: { selected: boolean } }) => ({
              style: {
                border: `1px solid ${context.selected ? "var(--accent)" : "var(--line)"}`,
                background: context.selected ? "var(--accent-soft)" : "transparent",
                color: context.selected ? "var(--accent-ink)" : "var(--ink-2)",
                borderRadius: 7, padding: "5px 10px",
                fontSize: 12, fontWeight: 500,
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
};

function Field({
  label, children, required,
}: {
  label: string; children: React.ReactNode; required?: boolean;
}) {
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