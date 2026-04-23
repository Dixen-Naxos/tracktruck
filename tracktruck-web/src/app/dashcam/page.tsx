"use client";

import { PageHeader, Card } from "@/components/primitives";

export default function DashcamPage() {
  return (
    <>
      <PageHeader title="Dashcam" subtitle="Lecture différée et événements"/>
      <Card style={{ marginTop: 24, padding: 64, textAlign: "center", color: "var(--ink-3)" }}>
        Module à déployer.
      </Card>
    </>
  );
}

