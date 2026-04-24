"use client";

import * as React from "react";
import type { Tweaks, ToastItem, ToastKind, ViewKey } from "@/lib/types";

interface AppContextValue {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
  tweaksOpen: boolean;
  setTweaksOpen: (v: boolean) => void;
  toasts: ToastItem[];
  toast: (msg: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
  active: ViewKey;
  setActive: (v: ViewKey) => void;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tweaks, setTweaks] = React.useState<Tweaks>({
    theme: "light",
    map: "schematic",
    sidebar: "expanded",
  });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [active, setActive] = React.useState<ViewKey>("chauffeurs");
  const toastIdRef = React.useRef(0);

  const setTweak = React.useCallback(<K extends keyof Tweaks>(k: K, v: Tweaks[K]) => {
    setTweaks((prev) => ({ ...prev, [k]: v }));
  }, []);

  const toast = React.useCallback((msg: string, kind: ToastKind = "info") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, kind, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const dismissToast = React.useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  React.useEffect(() => {
    document.body.dataset.theme = tweaks.theme;
    document.body.dataset.sidebar = tweaks.sidebar;
    document.body.dataset.map = tweaks.map;
  }, [tweaks]);

  const value: AppContextValue = {
    tweaks, setTweak, tweaksOpen, setTweaksOpen,
    toasts, toast, dismissToast, active, setActive,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
