import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { CATALOG_DESCRIPTIONS, SCHEMA_BY_TYPE } from "@/lib/a2ui-catalog";
import type { AgentResponse, ComponentType } from "@/lib/types";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_PROMPT = `You are a document analysis agent. For each paragraph, choose ONE interactive UI component from the catalog that enriches the reader's understanding — or null if the paragraph is genuinely boilerplate (filler transitions, page numbers, repeated headers).

DEFAULT TO PROVIDING A COMPONENT. Most paragraphs in a real document have at least one hook — a person, place, number, fact, term, or visualizable subject. Find it. Surface it. Empty margins are reserved for navigation cruft, not for content paragraphs.

When more than one component fits, pick the one that adds the most visual variety relative to the surrounding context (favor maps for places, images for objects, charts for numbers, bios for people, definitions for jargon, facts for standout stats, quotes only for genuinely pivotal lines).

Available components:
${CATALOG_DESCRIPTIONS}

You receive the current paragraph plus 0-2 previous paragraphs for context.

Return STRICT JSON with this exact shape:
{ "component": null }
OR
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
    model: "gemini-2.5-flash",
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
