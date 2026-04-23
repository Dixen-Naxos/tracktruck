"use client";

import * as React from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useAuth } from "@/context/AuthContext";

const FIREBASE_ERRORS: Record<string, string> = {
  "auth/invalid-credential":     "Email ou mot de passe incorrect.",
  "auth/user-not-found":         "Aucun compte associé à cet email.",
  "auth/wrong-password":         "Mot de passe incorrect.",
  "auth/too-many-requests":      "Trop de tentatives. Réessayez plus tard.",
  "auth/user-disabled":          "Ce compte a été désactivé.",
  "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  height: 44,
  borderRadius: 10,
  padding: "0 14px",
  fontSize: 13.5,
  color: "white",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 500, color: "rgba(255,255,255,0.45)",
  display: "block", marginBottom: 6,
};

export function LoginDialog({ visible }: { visible: boolean }) {
  const { signIn } = useAuth();
  const [email, setEmail]           = React.useState("");
  const [password, setPassword]     = React.useState("");
  const [error, setError]           = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(FIREBASE_ERRORS[code] ?? "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      visible={visible}
      modal
      closable={false}
      draggable={false}
      resizable={false}
      onHide={() => {}}
      pt={{
        mask: {
          style: {
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(8,12,24,0.88)", backdropFilter: "blur(14px)",
          },
        },
        root: {
          style: {
            width: "min(420px, calc(100vw - 32px))",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
          },
        },
        content: { style: { padding: "40px 36px" } },
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #6366f1, #3b82f6)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
            <path d="M3 15V7h10v8M13 11h4l3 3v1"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: "-0.02em", color: "white" }}>TrackTruck</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Espace supervision</div>
        </div>
      </div>

      <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 650, letterSpacing: "-0.025em", color: "white" }}>
        Connexion
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label htmlFor="tt-email" style={LABEL_STYLE}>Adresse e-mail</label>
          <InputText
            id="tt-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tracktruck.fr"
            autoComplete="email"
            required
            pt={{ root: { style: INPUT_STYLE } }}
          />
        </div>

        <div>
          <label htmlFor="tt-password" style={LABEL_STYLE}>Mot de passe</label>
          <Password
            inputId="tt-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            feedback={false}
            toggleMask
            autoComplete="current-password"
            required
            pt={{
              root:      { style: { display: "block", width: "100%" } },
              iconField: { style: { position: "relative", display: "block", width: "100%" } },
              input:     { style: { ...INPUT_STYLE, paddingRight: 44 } },
              showIcon:  { style: { position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.3)" } },
              hideIcon:  { style: { position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.3)" } },
            }}
          />
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
            {error}
          </div>
        )}

        <Button
          type="submit"
          label={submitting ? "Connexion…" : "Se connecter"}
          disabled={submitting}
          pt={{
            root: {
              style: {
                marginTop: 4, width: "100%", height: 44, borderRadius: 10,
                fontSize: 13.5, fontWeight: 600, color: "white",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: submitting ? 0.5 : 1,
              },
            },
          }}
        />
      </form>
    </Dialog>
  );
}