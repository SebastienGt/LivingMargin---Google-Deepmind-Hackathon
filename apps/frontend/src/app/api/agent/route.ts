import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { CATALOG_DESCRIPTIONS, SCHEMA_BY_TYPE } from "@/lib/a2ui-catalog";
import type { AgentResponse, ComponentType } from "@/lib/types";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const SYSTEM_PROMPT = `You are a document analysis agent that decides whether a paragraph warrants ONE interactive UI component in the margin, or none.

CRITICAL: Default to no component. Only emit one when it adds real comprehension value an educated reader would not spontaneously have. An empty margin is always better than a wrong or unnecessary component.

Available components:
${CATALOG_DESCRIPTIONS}

You receive the current paragraph plus 0-2 previous paragraphs for context.

Return STRICT JSON with this exact shape:
{ "component": null }
OR
{ "component": { "type": "bio-card" | "chart" | "map" | "quote-highlight", "data": { ... matching the type's data shape ... } } }

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
    model: "gemini-2.0-flash-exp",
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
        type: z.enum(["bio-card", "chart", "map", "quote-highlight"]),
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
