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

export const ImageSchema = z.object({
  query: z.string().describe("1-3 word search query for an illustrative photo"),
  caption: z.string(),
});

export const DefinitionSchema = z.object({
  term: z.string(),
  definition: z.string(),
});

export const FactSchema = z.object({
  label: z.string().describe("Short label (e.g., 'Population', 'Founded', 'Speed')"),
  value: z.string().describe("The headline number or fact"),
  context: z.string().describe("One-sentence context"),
});

export type BioCardProps = z.infer<typeof BioCardSchema>;
export type ChartProps = z.infer<typeof ChartSchema>;
export type MapProps = z.infer<typeof MapSchema>;
export type QuoteHighlightProps = z.infer<typeof QuoteHighlightSchema>;
export type ImageProps = z.infer<typeof ImageSchema>;
export type DefinitionProps = z.infer<typeof DefinitionSchema>;
export type FactProps = z.infer<typeof FactSchema>;

export const SCHEMA_BY_TYPE = {
  "bio-card": BioCardSchema,
  chart: ChartSchema,
  map: MapSchema,
  "quote-highlight": QuoteHighlightSchema,
  image: ImageSchema,
  definition: DefinitionSchema,
  fact: FactSchema,
} as const;

export const CATALOG_DESCRIPTIONS = `
1. bio-card — A person mentioned by name (historical figure, expert, author, character). Even briefly mentioned counts.
   data: { name: string, role: string, description: string }

2. chart — 3+ comparable numbers (years over time, categories, percentages, counts).
   data: { chartType: 'bar' | 'line', title: string, data: [{label: string, value: number}], unit?: string }

3. map — A specific place, region, country, city, or geographic movement. Use your world knowledge for lat/lng.
   data: { title: string, center: [lat: number, lng: number], zoom: number, markers: [{position: [lat: number, lng: number], label: string}] }

4. quote-highlight — Notable quoted statement, definition-style line, or memorable phrase from the paragraph.
   data: { quote: string, significance: string }

5. image — A visualizable noun in the paragraph (object, scene, landmark, animal, plant, food, artifact). Provide a 1-3 word search query.
   data: { query: string, caption: string }

6. definition — A term, concept, or piece of jargon that benefits from a brief explanation.
   data: { term: string, definition: string }

7. fact — A standout statistic, year, measurement, or notable single fact worth foregrounding.
   data: { label: string, value: string, context: string }
`.trim();
