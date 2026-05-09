"use client";

import dynamic from "next/dynamic";
import type { MapProps } from "@/lib/a2ui-catalog";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

export function MapComponent({ data }: { data: MapProps }) {
  return (
    <div>
      <p className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
        {data.title}
      </p>
      <div style={{ height: 220, width: "100%" }}>
        <MapContainer
          center={data.center}
          zoom={data.zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.markers.map((m, i) => (
            <Marker key={i} position={m.position}>
              <Popup>{m.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
