"use client";

import * as React from "react";
import { Card, PageHeader, SearchInput } from "@/components/primitives";
import { Icon } from "@/components/icons";
import { listDashcamVideos, getDashcamVideoUrl, retainDashcamVideo, unretainDashcamVideo } from "@/lib/api";
import type { DashcamVideo } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function VideoCard({ video, animIndex }: { video: DashcamVideo; animIndex: number }) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = React.useState(false);
  const [retained, setRetained] = React.useState(video.retained);
  const [retentionNote, setRetentionNote] = React.useState(video.retentionNote ?? "");
  const [showNoteInput, setShowNoteInput] = React.useState(false);
  const [noteInput, setNoteInput] = React.useState("");
  const [loadingRetain, setLoadingRetain] = React.useState(false);

  const handlePlay = async () => {
    if (url) return;
    setLoadingVideo(true);
    try {
      const signed = await getDashcamVideoUrl(video.id);
      setUrl(signed);
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleRetain = async () => {
    if (!noteInput.trim()) return;
    setLoadingRetain(true);
    try {
      await retainDashcamVideo(video.id, noteInput.trim());
      setRetained(true);
      setRetentionNote(noteInput.trim());
      setShowNoteInput(false);
      setNoteInput("");
    } finally {
      setLoadingRetain(false);
    }
  };

  const handleUnretain = async () => {
    setLoadingRetain(true);
    try {
      await unretainDashcamVideo(video.id);
      setRetained(false);
      setRetentionNote("");
    } finally {
      setLoadingRetain(false);
    }
  };

  return (
    <div className="tt-row-in" style={{ animationDelay: `${Math.min(animIndex * 40, 300)}ms` }}>
      <Card pad={0} className="overflow-hidden">
        {url ? (
          <video src={url} controls autoPlay style={{ width: "100%", display: "block", background: "#000" }} />
        ) : (
          <button
            onClick={handlePlay}
            disabled={loadingVideo}
            className="relative flex w-full cursor-pointer items-center justify-center border-0 p-0"
            style={{ height: 160, background: "oklch(0.13 0.02 240)" }}
          >
            {loadingVideo ? (
              <span style={{ color: "oklch(0.6 0.04 240)", fontSize: 13 }}>Chargement…</span>
            ) : (
              <Icon.video size={44} style={{ color: "oklch(0.38 0.06 240)" }} />
            )}
          </button>
        )}

        <div style={{ padding: "14px 16px 16px" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[14px] font-[550]">
                {video.driver ? `${video.driver.firstName} ${video.driver.lastName}` : "Chauffeur inconnu"}
              </div>
              <div className="mt-1 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
                {formatDate(video.timestamp)} · {formatTime(video.timestamp)}
              </div>
              {video.truckId && (
                <div className="mt-0.5 text-[12px]" style={{ color: "var(--ink-4)" }}>
                  {video.truckId}
                </div>
              )}
            </div>

            {retained ? (
              <button
                onClick={handleUnretain}
                disabled={loadingRetain}
                title="Retirer la conservation"
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border-0 px-2.5 py-1.5 text-[12px] font-[550] transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <Icon.pin size={13} />
                Conservée
              </button>
            ) : (
              <button
                onClick={() => { setShowNoteInput((v) => !v); setNoteInput(""); }}
                disabled={loadingRetain}
                title="Marquer pour conservation"
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border-0 px-2.5 py-1.5 text-[12px] transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ background: "var(--surface-2)", color: "var(--ink-3)", border: "1px solid var(--line)" }}
              >
                <Icon.pin size={13} />
                Conserver
              </button>
            )}
          </div>

          {retained && retentionNote && (
            <div className="mt-2 rounded-lg px-2.5 py-1.5 text-[12px]" style={{ background: "var(--accent-softer)", color: "var(--accent)" }}>
              {retentionNote}
            </div>
          )}

          {showNoteInput && !retained && (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRetain(); if (e.key === "Escape") setShowNoteInput(false); }}
                placeholder="Motif de conservation…"
                className="min-w-0 flex-1 rounded-lg border-0 px-3 py-1.5 text-[12.5px] outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-1)" }}
              />
              <button
                onClick={handleRetain}
                disabled={loadingRetain || !noteInput.trim()}
                className="cursor-pointer rounded-lg border-0 px-3 py-1.5 text-[12px] font-[550] disabled:opacity-40"
                style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
              >
                {loadingRetain ? "…" : "OK"}
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function DateTimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label
      className="inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[13px]"
      style={{ background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--ink-3)" }}
    >
      {label}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 bg-transparent text-[13px] outline-none"
        style={{ color: "var(--ink-1)" }}
      />
    </label>
  );
}

export default function DashcamPage() {
  const [videos, setVideos] = React.useState<DashcamVideo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo]     = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    const fromIso = from ? new Date(from).toISOString() : undefined;
    const toIso   = to   ? new Date(to).toISOString()   : undefined;
    listDashcamVideos(fromIso, toIso)
      .then((v) => { setVideos(v); })
      .finally(() => setLoading(false));
  }, [from, to]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return videos;
    const q = search.toLowerCase();
    return videos.filter((v) => {
      const name = v.driver ? `${v.driver.firstName} ${v.driver.lastName}`.toLowerCase() : "";
      return name.includes(q) || (v.truckId?.toLowerCase().includes(q) ?? false);
    });
  }, [videos, search]);

  return (
      <>
        <PageHeader title="Dashcam"/>

        <div className="mt-5 mb-[28px] flex flex-wrap items-center gap-3">
          <div className="min-w-[280px] flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher chauffeur, camion…" />
          </div>
          <DateTimeInput label="De" value={from} onChange={setFrom} />
          <DateTimeInput label="À"  value={to}   onChange={setTo}   />
          {(from || to) && (
            <button
              onClick={() => { setFrom(""); setTo(""); }}
              className="text-[12px] cursor-pointer border-0 bg-transparent"
              style={{ color: "var(--ink-3)" }}
            >
              Réinitialiser
            </button>
          )}
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

