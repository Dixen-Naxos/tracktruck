"use client";

import { useApp } from "@/context/AppContext";
import { Toast } from "./primitives";

export function ToastStack() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} kind={t.kind} onClose={() => dismissToast(t.id)}>
          {t.msg}
        </Toast>
      ))}
    </div>
  );
}
