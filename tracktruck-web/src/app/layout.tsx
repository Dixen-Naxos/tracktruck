import type { Metadata } from "next";
import "./globals.css";
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "TrackTruck · Supervision",
  description: "Supervision des chauffeurs, véhicules et commandes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <PrimeReactProvider value={{ unstyled: true }}>
          <AuthProvider>
            <AppProvider>
              <AppShell>{children}</AppShell>
            </AppProvider>
          </AuthProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
