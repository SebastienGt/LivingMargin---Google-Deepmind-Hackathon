"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapProps } from "@/lib/a2ui-schemas";
import "leaflet/dist/leaflet.css";

export default function MapInner({ data }: { data: MapProps }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (mapRef.current) return;

    const map = L.map(el, {
      center: data.center,
      zoom: data.zoom,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    for (const m of data.markers) {
      L.marker(m.position).addTo(map).bindPopup(m.label);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [data.center, data.zoom, data.markers]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
