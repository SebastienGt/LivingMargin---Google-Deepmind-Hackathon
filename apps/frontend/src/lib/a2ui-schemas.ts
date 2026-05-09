import { z } from "zod";

// Shared, server-safe Zod schemas for the A2UI catalog. The component
// renderers and `createCatalog` call live in the client-only
// `a2ui-catalog.tsx` and import these schemas from here.

export const BioCardSchema = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
});

export const ChartSchema = z.object({
  chartType: z.enum(["bar", "line"]),
  title: z.string(),
  data: z.array(z.object({ label: z.string(), value: z.number() })),
  unit: z.string().optional(),
});

export const MapSchema = z.object({
  title: z.string(),
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number(),
  markers: z.array(
    z.object({
      position: z.tuple([z.number(), z.number()]),
      label: z.string(),
    }),
  ),
});

export const QuoteHighlightSchema = z.object({
  quote: z.string(),
  significance: z.string(),
});

export const ImageSchema = z.object({
  query: z.string(),
  caption: z.string(),
});

export const DefinitionSchema = z.object({
  term: z.string(),
  definition: z.string(),
});

export const FactSchema = z.object({
  label: z.string(),
  value: z.string(),
  context: z.string(),
});

export type BioCardProps = z.infer<typeof BioCardSchema>;
export type ChartProps = z.infer<typeof ChartSchema>;
export type MapProps = z.infer<typeof MapSchema>;
export type QuoteHighlightProps = z.infer<typeof QuoteHighlightSchema>;
export type ImageProps = z.infer<typeof ImageSchema>;
export type DefinitionProps = z.infer<typeof DefinitionSchema>;
export type FactProps = z.infer<typeof FactSchema>;

export const A2UI_DEFINITIONS = {
  BioCard: {
    description:
      "A compact card for a named person. Use when a person is mentioned (real, fictional, historical, or contemporary). data: { name, role, description }",
    props: BioCardSchema,
  },
  Chart: {
    description:
      "A bar or line chart. Use only when the paragraph contains 3+ comparable numbers. data: { chartType: 'bar'|'line', title, data: [{label, value}], unit? }",
    props: ChartSchema,
  },
  Map: {
    description:
      "A map with markers. Use when a specific place, region, or geographic feature is central. Latitude/longitude come from your world knowledge. data: { title, center: [lat, lng], zoom, markers: [{position: [lat, lng], label}] }",
    props: MapSchema,
  },
  QuoteHighlight: {
    description:
      "A pulled quote with significance. Use for memorable phrases, mottos, or genuinely pivotal quoted statements. data: { quote, significance }",
    props: QuoteHighlightSchema,
  },
  Image: {
    description:
      "An illustrative image. Use for any concrete object, scene, animal, plant, food, artifact, or building mentioned. Provide a 1-3 word search query. data: { query, caption }",
    props: ImageSchema,
  },
  Definition: {
    description:
      "A term + brief explanation. Use for jargon, technical concepts, or domain terms worth defining. data: { term, definition }",
    props: DefinitionSchema,
  },
  Fact: {
    description:
      "A standout statistic, year, or measurement worth foregrounding. data: { label, value, context }",
    props: FactSchema,
  },
};

export const SCHEMA_BY_TYPE = {
  "bio-card": BioCardSchema,
  chart: ChartSchema,
  map: MapSchema,
  "quote-highlight": QuoteHighlightSchema,
  image: ImageSchema,
  definition: DefinitionSchema,
  fact: FactSchema,
} as const;

export const CATALOG_DESCRIPTIONS = Object.entries(A2UI_DEFINITIONS)
  .map(([key, { description }], i) => `${i + 1}. ${key} — ${description}`)
  .join("\n\n");
