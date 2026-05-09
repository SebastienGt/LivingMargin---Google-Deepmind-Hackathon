"use client";

import type { MarginComponent } from "@/lib/types";
import {
  BioCardSchema,
  ChartSchema,
  MapSchema,
  QuoteHighlightSchema,
} from "@/lib/a2ui-catalog";
import { BioCard } from "./margin/BioCard";
import { Chart } from "./margin/Chart";
import { MapComponent } from "./margin/MapComponent";
import { QuoteHighlight } from "./margin/QuoteHighlight";

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
      <div className="h-20 w-full animate-pulse rounded-xl bg-zinc-100" />
    );
  }
  if (component === null) {
    return null;
  }
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {renderComponent(component)}
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
  }
}
