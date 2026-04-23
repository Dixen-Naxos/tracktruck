import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { TweaksPanel } from "@/components/TweaksPanel";
import { ToastStack } from "@/components/ToastStack";

export const metadata: Metadata = {
  title: "TrackTruck · Supervision",
  description: "Supervision des chauffeurs, véhicules et commandes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 px-[42px] py-[28px]">
              <TopBar />
              {children}
            </main>
          </div>
          <TweaksPanel />
          <ToastStack />
        </AppProvider>
      </body>
    </html>
  );
}
