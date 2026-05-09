// Stub CopilotKit runtime endpoint. The CopilotKitProvider in our app
// requires a runtimeUrl at construction time, but in this build we
// drive component decisions through /api/agent rather than through a
// CopilotKit runtime. This stub returns 200/empty so the provider's
// initial info-fetch doesn't 404 the dev console with errors.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ agents: [] });
}

export async function POST() {
  return NextResponse.json({});
}
