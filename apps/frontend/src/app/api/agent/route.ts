import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { CATALOG_DESCRIPTIONS, SCHEMA_BY_TYPE } from "@/lib/a2ui-catalog";
import type { AgentResponse, ComponentType } from "@/lib/types";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_PROMPT = `You are a document analysis agent. For EVERY paragraph, you MUST choose ONE interactive UI component from the catalog that enriches the reader's understanding.

NEVER RETURN NULL. Every paragraph — even short transitions, even seemingly mundane sentences — has at least one hook you can foreground: a noun to illustrate, a phrase worth quoting, a term worth defining, a fact worth highlighting. Find it. The catalog is wide enough that something always fits.

VARIETY IS THE POINT. Look at the previous paragraphs' components and AVOID repeating the same type when something else fits. Aim for visual diversity across the right column (rotate through bios, charts, maps, quotes, images, definitions, and facts as the document permits).

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

Return STRICT JSON with this exact shape (component must be present, never null):
{ "component": { "type": "bio-card" | "chart" | "map" | "quote-highlight" | "image" | "definition" | "fact", "data": { ... matching the type's data shape ... } } }

No markdown, no code fences, no extra text outside the JSON object.`;

const RequestBody = z.object({
  blockId: z.string(),
  currentText: z.string(),
  previousTexts: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  let body;
  try {
    body = RequestBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  const userMessage = `${body.previousTexts.length > 0 ? `Previous paragraphs:\n${body.previousTexts.map((t, i) => `[${i + 1}] ${t}`).join("\n\n")}\n\n` : ""}Current paragraph:\n${body.currentText}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  let raw: string;
  try {
    const result = await model.generateContent(userMessage);
    raw = result.response.text();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Gemini call failed";
    return NextResponse.json({ blockId: body.blockId, component: null, error: message } satisfies AgentResponse & { error: string });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ blockId: body.blockId, component: null } satisfies AgentResponse);
  }

  const Outer = z.object({
    component: z
      .object({
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
      })
      .nullable(),
  });

  const outer = Outer.safeParse(parsed);
  if (!outer.success || outer.data.component === null) {
    return NextResponse.json({ blockId: body.blockId, component: null } satisfies AgentResponse);
  }

  const { type, data } = outer.data.component;
  const schema = SCHEMA_BY_TYPE[type as ComponentType];
  const dataValid = schema.safeParse(data);
  if (!dataValid.success) {
    return NextResponse.json({ blockId: body.blockId, component: null } satisfies AgentResponse);
  }

  return NextResponse.json({
    blockId: body.blockId,
    component: { type, data: dataValid.data },
  } satisfies AgentResponse);
}
