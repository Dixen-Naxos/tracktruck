"use client";

import * as React from "react";
import { Btn, Card, Hairline, PageHeader, SearchInput } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { listDashcamVideos, getDashcamVideoUrl } from "@/lib/api";
import type { DashcamVideo } from "@/lib/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function VideoCard({
  video, animIndex, loadingId, onPlay,
}: {
  video: DashcamVideo;
  animIndex: number;
  loadingId: string | null;
  onPlay: () => void;
}) {
  const isLoading = loadingId === video.id;
  return (
    <div
      className="tt-row-in"
      style={{ animationDelay: `${Math.min(animIndex * 40, 300)}ms` }}
    >
      <Card pad={0} className="overflow-hidden">
        <button
          onClick={onPlay}
          disabled={!!loadingId}
          className="w-full cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          <div
            className="relative flex items-center justify-center"
            style={{ height: 160, background: "oklch(0.13 0.02 240)" }}
          >
            <Icon.video size={44} style={{ color: "oklch(0.38 0.06 240)" }} />
            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                <span style={{ color: "#fff", fontSize: 13 }}>Chargement…</span>
              </div>
            )}
          </div>
        </button>
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
          <Btn
            variant="soft"
            size="sm"
            icon={<Icon.video size={13} />}
            style={{ marginTop: 12 }}
            disabled={!!loadingId}
            onClick={onPlay}
          >
            {isLoading ? "Chargement…" : "Lire"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function VideoModal({
  video, url, onClose,
}: {
  video: DashcamVideo;
  url: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,17,28,0.75)", backdropFilter: "blur(12px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="tt-modal-in w-full overflow-hidden"
        style={{
          maxWidth: 880,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="text-[15px] font-[600]">{video.driverName}</div>
            <div className="mt-0.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
              {formatDate(video.timestamp)} · {formatTime(video.timestamp)}
              {video.truckId && ` · ${video.truckId}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0"
            style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}
          >
            <Icon.close size={16} />
          </button>
        </div>
        <Hairline />
        <div style={{ background: "#000" }}>
          {url ? (
            <video
              src={url}
              controls
              autoPlay
              style={{ width: "100%", maxHeight: "62vh", display: "block" }}
            />
          ) : (
            <div
              className="flex items-center justify-center py-20 text-[13px]"
              style={{ color: "var(--ink-4)" }}
            >
              Vidéo non disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashcamPage() {
  const [videos, setVideos] = React.useState<DashcamVideo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [playing, setPlaying] = React.useState<{ video: DashcamVideo; url: string } | null>(null);

  React.useEffect(() => {
    listDashcamVideos().then((v) => { setVideos(v); setLoading(false); });
  }, []);

  const handlePlay = async (video: DashcamVideo) => {
    setLoadingId(video.id);
    try {
      const url = await getDashcamVideoUrl(video.id);
      setPlaying({ video, url });
    } finally {
      setLoadingId(null);
    }
  };

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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher chauffeur, camion…"
          />
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {filtered.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              animIndex={i}
              loadingId={loadingId}
              onPlay={() => handlePlay(v)}
            />
          ))}
        </div>
      )}

      {playing && (
        <VideoModal
          video={playing.video}
          url={playing.url}
          onClose={() => setPlaying(null)}
        />
      )}
    </>
  );
}
