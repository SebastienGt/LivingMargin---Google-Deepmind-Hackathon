import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { CATALOG_DESCRIPTIONS, SCHEMA_BY_TYPE } from "@/lib/a2ui-schemas";
import type { AgentResponse, ComponentType, MarginComponent } from "@/lib/types";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_PROMPT = `You are a document analysis agent. For EVERY paragraph or selection, you MUST return between 4 and 7 interactive UI components from the catalog that each enrich the reader's understanding from a different angle. The exact target count for THIS request is provided in the user message — match it.

NEVER RETURN AN EMPTY ARRAY. Every paragraph — even short transitions — has multiple hooks you can foreground: a noun to illustrate, a phrase worth quoting, a term worth defining, a number worth highlighting, a place worth mapping, a person worth profiling. Pick the strongest hooks per paragraph.

VARIETY IS THE POINT. Within a single paragraph, the components MUST be of DIFFERENT types — never two charts in a row, never two definitions. Rotate through bios, charts, maps, quotes, images, definitions, and facts. Use the previous paragraphs' components as additional context to avoid global monotony.

Type-selection guide:
- map → any place, region, country, city, geographic feature
- bio-card → any named person (real or fictional)
- image → any concrete object, scene, animal, plant, food, artifact, building
- chart → 3+ comparable numbers
- fact → a single standout statistic, year, measurement
- definition → a domain term, jargon, technical concept
- quote-highlight → a memorable phrase, motto, or quotable statement (use sparingly)

Available components:
${CATALOG_DESCRIPTIONS}

You receive the current paragraph plus 0-2 previous paragraphs for context.

Return STRICT JSON with this exact shape:
{ "components": [ { "type": "bio-card" | "chart" | "map" | "quote-highlight" | "image" | "definition" | "fact", "data": { ... matching the type's data shape ... } }, ... ] }

No markdown, no code fences, no extra text outside the JSON object.`;

const RequestBody = z.object({
  blockId: z.string(),
  currentText: z.string(),
  previousTexts: z.array(z.string()).default([]),
  desiredCount: z.number().int().min(1).max(8).default(4),
});

export async function POST(req: Request) {
  let body: z.infer<typeof RequestBody>;
  try {
    body = RequestBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not set" },
      { status: 500 },
    );
  }

  const userMessage = `${body.previousTexts.length > 0 ? `Previous paragraphs:\n${body.previousTexts.map((t, i) => `[${i + 1}] ${t}`).join("\n\n")}\n\n` : ""}Target count: ${body.desiredCount} components.\n\nCurrent paragraph:\n${body.currentText}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(userMessage);
  const raw = result.response.text();
  const parsed: unknown = JSON.parse(raw);

  const ComponentSchema = z.object({
    type: z.enum([
      "bio-card",
      "chart",
      "map",
      "quote-highlight",
      "image",
      "definition",
      "fact",
    ]),
    data: z.unknown(),
  });
  const Outer = z.object({
    components: z.array(ComponentSchema).default([]),
  });

  const outer = Outer.parse(parsed);

  const components: MarginComponent[] = [];
  for (const item of outer.components) {
    const schema = SCHEMA_BY_TYPE[item.type as ComponentType];
    const r = schema.safeParse(item.data);
    if (r.success) components.push({ type: item.type, data: r.data });
  }

  return NextResponse.json({
    blockId: body.blockId,
    components,
  } satisfies AgentResponse);
}
