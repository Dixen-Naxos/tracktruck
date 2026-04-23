"use client";

import { PageHeader, Card } from "@/components/primitives";

export default function CommandesPage() {
  return (
    <>
      <PageHeader title="Commandes" subtitle="Suivi opérationnel"/>
      <Card style={{ marginTop: 24, padding: 64, textAlign: "center", color: "var(--ink-3)" }}>
        Module à déployer — voir <span className="font-mono">/chauffeurs</span> pour le module développé.
      </Card>
    </>
  );
}
