"use client";

import { createCatalog } from "@copilotkit/a2ui-renderer";
import type { CatalogRenderers } from "@copilotkit/a2ui-renderer";
import { A2UI_DEFINITIONS } from "./a2ui-schemas";
import { BioCard } from "@/components/margin/BioCard";
import { Chart } from "@/components/margin/Chart";
import { Definition } from "@/components/margin/Definition";
import { Fact } from "@/components/margin/Fact";
import { Image } from "@/components/margin/Image";
import { MapComponent } from "@/components/margin/MapComponent";
import { QuoteHighlight } from "@/components/margin/QuoteHighlight";

// Renderers — A2UI invokes these as React.FC<RendererProps<T>>; we
// destructure `props` (resolved data values from the A2UI data model)
// and forward to our renderers.
const livingMarginRenderers: CatalogRenderers<typeof A2UI_DEFINITIONS> = {
  BioCard: ({ props }) => <BioCard data={props} />,
  Chart: ({ props }) => <Chart data={props} />,
  Map: ({ props }) => <MapComponent data={props} />,
  QuoteHighlight: ({ props }) => <QuoteHighlight data={props} />,
  Image: ({ props }) => <Image data={props} />,
  Definition: ({ props }) => <Definition data={props} />,
  Fact: ({ props }) => <Fact data={props} />,
};

export const livingMarginCatalog = createCatalog(
  A2UI_DEFINITIONS,
  livingMarginRenderers,
  {
    catalogId: "living-margin",
    includeBasicCatalog: true,
  },
);
