"use client";

import * as React from "react";
import { Card, PageHeader, SearchInput } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { listDashcamVideos, getDashcamVideoUrl } from "@/lib/api";
import type { DashcamVideo } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function VideoCard({ video, animIndex }: { video: DashcamVideo; animIndex: number }) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handlePlay = async () => {
    if (url) return;
    setLoading(true);
    try {
      const signed = await getDashcamVideoUrl(video.id);
      setUrl(signed);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="tt-row-in" style={{ animationDelay: `${Math.min(animIndex * 40, 300)}ms` }}>
        <Card pad={0} className="overflow-hidden">
          {url ? (
              <video
                  src={url}
                  controls
                  autoPlay
                  style={{ width: "100%", display: "block", background: "#000" }}
              />
          ) : (
              <button
                  onClick={handlePlay}
                  disabled={loading}
                  className="relative flex w-full cursor-pointer items-center justify-center border-0 p-0"
                  style={{ height: 160, background: "oklch(0.13 0.02 240)" }}
              >
                {loading ? (
                    <span style={{ color: "oklch(0.6 0.04 240)", fontSize: 13 }}>Chargement…</span>
                ) : (
                    <Icon.video size={44} style={{ color: "oklch(0.38 0.06 240)" }} />
                )}
              </button>
          )}
          <div style={{ padding: "14px 16px 16px" }}>
            <div className="truncate text-[14px] font-[550]">{video.driverName}</div>
            <div className="mt-1 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
              {formatDate(video.timestamp)} · {formatTime(video.timestamp)}
            </div>
            {video.truckId && (
                <div className="mt-0.5 text-[12px]" style={{ color: "var(--ink-4)" }}>
                  {video.truckId}
                </div>
            )}
          </div>
        </Card>
      </div>
  );
}

export default function DashcamPage() {
  const [videos, setVideos] = React.useState<DashcamVideo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    listDashcamVideos().then((v) => { setVideos(v); setLoading(false); });
  }, []);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter(
        (v) =>
            v.driverName.toLowerCase().includes(q) ||
            (v.truckId?.toLowerCase().includes(q) ?? false),
    );
  }, [videos, search]);

  return (
      <>
        <PageHeader title="Dashcam" subtitle="Lecture différée et événements — UC-SUP-11" />

        <div className="mt-5 mb-[18px] flex flex-wrap items-center gap-3">
          <div className="min-w-[280px] flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher chauffeur, camion…" />
          </div>
          <div style={{ color: "var(--ink-3)", fontSize: 13 }}>
            {loading ? "…" : `${filtered.length} segment${filtered.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {loading ? (
            <div className="py-20 text-center text-[13px]" style={{ color: "var(--ink-3)" }}>
              Chargement des segments…
            </div>
        ) : filtered.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 60, color: "var(--ink-3)" }}>
              Aucun enregistrement ne correspond à la recherche.
            </Card>
        ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {filtered.map((v, i) => (
                  <VideoCard key={v.id} video={v} animIndex={i} />
              ))}
            </div>
        )}
      </>
  );
}

