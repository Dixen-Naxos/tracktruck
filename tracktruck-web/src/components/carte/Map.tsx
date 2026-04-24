"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` on import — never render on the server.
const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="tt-map tt-map--loading">
      <div className="tt-map__spinner" aria-hidden />
      <span>Chargement de la carte…</span>
    </div>
  ),
});

export default MapClient;
