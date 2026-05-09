"use client";

import type { ComponentType, MarginComponent } from "@/lib/types";
import {
  BioCardSchema,
  ChartSchema,
  DefinitionSchema,
  FactSchema,
  ImageSchema,
  MapSchema,
  QuoteHighlightSchema,
} from "@/lib/a2ui-catalog";
import { BioCard } from "./margin/BioCard";
import { Chart } from "./margin/Chart";
import { Definition } from "./margin/Definition";
import { Fact } from "./margin/Fact";
import { Image } from "./margin/Image";
import { MapComponent } from "./margin/MapComponent";
import { QuoteHighlight } from "./margin/QuoteHighlight";

const ACCENT_BY_TYPE: Record<ComponentType, string> = {
  "bio-card": "before:bg-sky-400/70",
  chart: "before:bg-violet-400/70",
  map: "before:bg-emerald-400/70",
  "quote-highlight": "before:bg-amber-400/70",
  image: "before:bg-pink-400/70",
  definition: "before:bg-rose-400/70",
  fact: "before:bg-cyan-400/70",
};

export function Margin({
  status,
  component,
}: {
  status: "idle" | "pending" | "ready";
  component: MarginComponent | null;
}) {
  if (status === "idle") {
    return null;
  }
  if (status === "pending") {
    return (
      <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-stone-200/60 bg-white/70">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-100 to-transparent animate-shimmer" />
      </div>
    );
  }
  if (component === null) {
    return null;
  }
  const accent = ACCENT_BY_TYPE[component.type];
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] ring-1 ring-stone-200/70 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accent}`}
    >
      <div className="pl-1">{renderComponent(component)}</div>
    </div>
  );
}

function renderComponent(c: MarginComponent) {
  switch (c.type) {
    case "bio-card": {
      const r = BioCardSchema.safeParse(c.data);
      if (!r.success) return null;
      return <BioCard data={r.data} />;
    }
    case "chart": {
      const r = ChartSchema.safeParse(c.data);
      if (!r.success) return null;
      return <Chart data={r.data} />;
    }
    case "map": {
      const r = MapSchema.safeParse(c.data);
      if (!r.success) return null;
      return <MapComponent data={r.data} />;
    }
    case "quote-highlight": {
      const r = QuoteHighlightSchema.safeParse(c.data);
      if (!r.success) return null;
      return <QuoteHighlight data={r.data} />;
    }
    case "image": {
      const r = ImageSchema.safeParse(c.data);
      if (!r.success) return null;
      return <Image data={r.data} />;
    }
    case "definition": {
      const r = DefinitionSchema.safeParse(c.data);
      if (!r.success) return null;
      return <Definition data={r.data} />;
    }
    case "fact": {
      const r = FactSchema.safeParse(c.data);
      if (!r.success) return null;
      return <Fact data={r.data} />;
    }
  }
}
