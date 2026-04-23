"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TweaksPanel } from "./TweaksPanel";
import { ToastStack } from "./ToastStack";
import { LoginDialog } from "./LoginDialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#080c18" }}>
        <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>Chargement…</div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 px-[42px] py-[28px]">
              <TopBar />
              {children}
            </main>
          </div>
          <TweaksPanel />
          <ToastStack />
        </>
      ) : (
        <div className="min-h-screen" style={{ background: "#080c18" }} />
      )}
      <LoginDialog visible={!user} />
    </>
  );
}