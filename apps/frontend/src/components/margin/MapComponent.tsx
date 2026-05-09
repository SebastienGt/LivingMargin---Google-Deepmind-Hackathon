"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import type { MapProps } from "@/lib/a2ui-schemas";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-stone-100" />
  ),
});

export function MapComponent({ data }: { data: MapProps }) {
  const id = useId();
  return (
    <div>
      <p className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
        {data.title}
      </p>
      <div style={{ height: 220, width: "100%" }}>
        <MapInner key={id} data={data} />
      </div>
    </div>
  );
}
