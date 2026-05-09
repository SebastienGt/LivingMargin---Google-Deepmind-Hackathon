import { z } from "zod";

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

export type BioCardProps = z.infer<typeof BioCardSchema>;
export type ChartProps = z.infer<typeof ChartSchema>;
export type MapProps = z.infer<typeof MapSchema>;
export type QuoteHighlightProps = z.infer<typeof QuoteHighlightSchema>;

export const SCHEMA_BY_TYPE = {
  "bio-card": BioCardSchema,
  chart: ChartSchema,
  map: MapSchema,
  "quote-highlight": QuoteHighlightSchema,
} as const;

export const CATALOG_DESCRIPTIONS = `
1. bio-card — Use when a person is mentioned whose role/significance benefits from a quick reference. Don't use for every name.
   data shape: { name: string, role: string, description: string }

2. chart — Use only when the paragraph contains 3+ comparable numbers that benefit from visualization.
   data shape: { chartType: 'bar' | 'line', title: string, data: [{label: string, value: number}], unit?: string }

3. map — Use when a specific location or geographic area is central to the paragraph. Latitude/longitude come from your world knowledge.
   data shape: { title: string, center: [lat: number, lng: number], zoom: number, markers: [{position: [lat: number, lng: number], label: string}] }

4. quote-highlight — Use rarely, only for genuinely pivotal quoted statements.
   data shape: { quote: string, significance: string }
`.trim();
