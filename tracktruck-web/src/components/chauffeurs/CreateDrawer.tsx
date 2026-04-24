import * as React from "react";
import { Btn } from "../primitives";
import { Icon } from "../icons";
import { SKILLS } from "@/lib/data";
import type { Driver } from "@/lib/types";

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  skills: string[];
  zones: string;
}

export function CreateDriver({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: Omit<Driver, "id">) => void;
}) {
  const [form, setForm] = React.useState<FormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    skills: ["pl"],
    zones: "Île-de-France",
  });
  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = !!(form.firstName && form.lastName);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!canSubmit) return;
    const tone = Math.floor(Math.random() * 360);
    const initials = (form.firstName[0] + form.lastName[0]).toUpperCase();
    onCreate({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      skills: form.skills,
      zones: form.zones.split(",").map((z) => z.trim()),
      avatarTone: tone,
      initials,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end"
      style={{
        background: "rgba(15,17,28,0.35)",
        backdropFilter: "blur(8px)",
        animation: "ttFadeIn .22s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="tt-modal-in flex h-screen w-[480px] flex-col"
        style={{ background: "var(--surface)", boxShadow: "var(--shadow-lg)" }}
      >
        <div
          style={{ borderBottom: "1px solid var(--line)" }}
          className="flex items-center justify-between px-6 py-5"
        >
          <div>
            <div className="text-[17px] font-[650] -tracking-[0.02em]">
              Nouveau chauffeur
            </div>
            <div
              style={{ color: "var(--ink-3)" }}
              className="mt-0.5 text-[12.5px]"
            >
              Ajoutez un profil au référentiel
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0"
            aria-label="Fermer"
          >
            <Icon.close size={16} />
          </button>
        </div>
        <div className="grid flex-1 gap-4 overflow-auto px-6 py-5">
          <Row2>
            <Input
              label="Prénom"
              value={form.firstName}
              onChange={(v) => upd("firstName", v)}
              required
            />
            <Input
              label="Nom"
              value={form.lastName}
              onChange={(v) => upd("lastName", v)}
              required
            />
          </Row2>
          <Row2>
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(v) => upd("phone", v)}
              placeholder="+33 …"
            />
            <Input
              label="E-mail"
              value={form.email}
              onChange={(v) => upd("email", v)}
              placeholder="prenom.nom@tracktruck.fr"
            />
          </Row2>
          <Input
            label="Zones autorisées"
            value={form.zones}
            onChange={(v) => upd("zones", v)}
          />

          <div>
            <label
              style={{ color: "var(--ink-3)" }}
              className="text-[12px] font-semibold uppercase tracking-[0.3px]"
            >
              Compétences
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SKILLS.map((s) => {
                const active = form.skills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      upd(
                        "skills",
                        active
                          ? form.skills.filter((x) => x !== s.id)
                          : [...form.skills, s.id],
                      )
                    }
                    style={{
                      border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                      background: active ? "var(--accent-soft)" : "transparent",
                      color: active ? "var(--accent-ink)" : "var(--ink-2)",
                    }}
                    className="cursor-pointer rounded-[7px] px-2.5 py-[5px] text-[12px] font-medium"
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div
          style={{ borderTop: "1px solid var(--line)" }}
          className="flex justify-end gap-2.5 px-6 py-4"
        >
          <Btn variant="ghost" onClick={onClose}>
            Annuler
          </Btn>
          <Btn variant="primary" disabled={!canSubmit} onClick={submit}>
            Créer le chauffeur
          </Btn>
        </div>
      </div>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span
        style={{ color: "var(--ink-3)" }}
        className="text-[12px] font-semibold uppercase tracking-[0.3px]"
      >
        {label}
        {required && (
          <span style={{ color: "var(--danger)" }} className="ml-1">
            *
          </span>
        )}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "1px solid var(--line-strong)",
          background: "var(--surface)",
          color: "var(--ink-1)",
        }}
        className="mt-1.5 h-9 w-full rounded-[9px] px-3 text-[13.5px] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
      />
    </label>
  );
}
