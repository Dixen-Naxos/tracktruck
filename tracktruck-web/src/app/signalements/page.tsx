"use client";

import { PageHeader, Card } from "@/components/primitives";

export default function SignalementsPage() {
  return (
    <>
      <PageHeader title="Signalements" subtitle="Incidents terrain"/>
      <Card style={{ marginTop: 24, padding: 64, textAlign: "center", color: "var(--ink-3)" }}>
        Module à déployer.
      </Card>
    </>
  );
}
