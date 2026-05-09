# livingMargin — 2-Hour Hackathon Spec

**Date:** 2026-05-09
**Budget:** 2 hours of build time. Starter-kit-based; customize, do not scaffold.

## 1. Concept

Upload a PDF. The document renders on the left. A LangGraph Deep Agent picks one (or zero) interactive component per paragraph from a small A2UI catalog and renders it in the right margin. No chat, no text input besides the upload.

## 2. Core Principles

- **No chat interface.** Upload + scroll + click. The CopilotKit chat surface from the starter kit is hidden.
- **The agent decides.** Default to no component. Empty margin > wrong margin.
- **Streaming via prefetch.** Components fetch as paragraphs enter the viewport, plus 3 ahead.

## 3. Base: Generative-UI-Global-Hackathon-Starter-Kit

Fork from `https://github.com/jerelvelarde/Generative-UI-Global-Hackathon-Starter-Kit`. The kit ships a working monorepo with CopilotKit, LangChain Deep Agents (Gemini 3.1 Flash-Lite), A2UI, and MCP already wired:

```
apps/
  frontend/    Next.js + CopilotKit + A2UI catalog + canvas page (we replace the page)
  agent/       Python LangGraph Deep Agent + Gemini runtime (we modify the prompt)
  mcp/         Deployable MCP server (we extend Tier 2 only — image card via MCP Apps)
dev-docs/
.env.example
```

Setup: clone, copy `.env.example`, drop in `GOOGLE_API_KEY`, run `npm run dev` (or per kit's instructions). The agent boots, the canvas appears.

## 4. Generative UI Tier Strategy

The kit supports three tiers (per its README's spectrum). We use:

- **Declarative (A2UI)** for the structured sidebar components — bio-card, chart, map, quote-highlight. Schema-driven, sandboxed-by-default, agent emits via `render_a2ui` tool.
- **Open-ended (MCP Apps / MCP-UI)** for an image card (Tier 2) — agent emits sandboxed HTML with a generated image. Uses the kit's pre-wired `openGenerativeUI` surface.

We do **not** use the controlled tier (`useComponent`) — it's for fixed app workflows, not per-paragraph decisions.

## 5. Tech Stack (inherited from kit)

- **Next.js 15** App Router + TypeScript + Tailwind v4 (in `apps/frontend`)
- **CopilotKit** (`@copilotkit/react-core`) with A2UI catalog passed via `<CopilotKitProvider a2ui={{catalog}}>`
- **LangChain Deep Agent** (Python) in `apps/agent/src/runtime.py`, calling Gemini 3.1 Flash-Lite
- **`pdfjs-dist`** for PDF parsing in a new Next.js API route
- **Recharts** for charts, **`react-leaflet`** for maps, **lucide-react** for icons (add if not in kit)
- **MCP server** in `apps/mcp` only used for Tier 2 image card

## 6. Customizations (what we change in the kit)

### `apps/frontend`

**Replace** the existing canvas page with our document viewer.

```
apps/frontend/
  app/
    page.tsx                        # REPLACED: upload zone or document viewer
    api/
      parse/route.ts                # NEW: POST PDF → ParsedDocument JSON
      copilotkit/route.ts           # KEEP from kit (CopilotKit runtime)
    layout.tsx                      # MODIFIED: hide CopilotKit chat sidebar
  lib/
    a2ui-catalog.ts                 # NEW: 4 component definitions + renderers
    pdfParse.ts                     # NEW: pdfjs-dist text → DocumentBlock[]
    types.ts                        # NEW: DocumentBlock, ParsedDocument
  components/
    UploadZone.tsx                  # NEW
    DocumentViewer.tsx              # NEW: 2-col grid, IntersectionObserver per paragraph
    Margin.tsx                      # NEW: dispatches to A2UI renderer or null
    margin/
      BioCard.tsx                   # NEW (A2UI renderer)
      Chart.tsx                     # NEW (A2UI renderer)
      MapComponent.tsx              # NEW (A2UI renderer)
      QuoteHighlight.tsx            # NEW (A2UI renderer)
```

### `apps/agent`

**Modify** the system prompt and one tool.

- `apps/agent/src/runtime.py` — replace the canvas-oriented prompt with our document-analysis prompt (§9), keep Gemini 3.1 Flash-Lite as the model.
- Add (or repurpose) a tool `decide_margin_component(block_id, text, prev_blocks)` that the agent invokes per paragraph; the tool uses `render_a2ui` internally to emit one component (or null).

### `apps/mcp` (Tier 2 only)

If time allows, add a `generate_image_card` MCP tool that returns a sandboxed `UIResource` (HTML with `<img>` from Unsplash search by keyword). Wire it into the agent's tool list so the agent can call it when a paragraph has a visualizable noun.

## 7. Data Models (`apps/frontend/lib/types.ts`)

```typescript
export interface DocumentBlock {
  id: string;        // "block-0", "block-1", …
  index: number;
  text: string;
  type: 'paragraph' | 'heading';
}

export interface ParsedDocument {
  title: string;
  blocks: DocumentBlock[];
}
```

No `MarginComponent` type needed at the frontend boundary — A2UI's catalog handles type-safety end-to-end via Zod.

## 8. A2UI Catalog (`apps/frontend/lib/a2ui-catalog.ts`)

Pattern from the A2UI guide's section 3: definitions + renderers + `createCatalog` + provider registration.

```typescript
import { z } from 'zod';
import { createCatalog } from '@copilotkit/react-core'; // exact import per kit's version
import { BioCard } from '@/components/margin/BioCard';
import { Chart } from '@/components/margin/Chart';
import { MapComponent } from '@/components/margin/MapComponent';
import { QuoteHighlight } from '@/components/margin/QuoteHighlight';

export const livingMarginDefinitions = {
  BioCard: {
    description: 'A compact card for a named person. Use when a person is named whose role is non-obvious or central to the paragraph.',
    props: z.object({
      name: z.string(),
      role: z.string(),
      description: z.string(),
    }),
  },
  Chart: {
    description: 'A bar or line chart. Use only when the paragraph contains 3+ comparable numbers.',
    props: z.object({
      chartType: z.enum(['bar', 'line']),
      title: z.string(),
      data: z.array(z.object({ label: z.string(), value: z.number() })),
      unit: z.string().optional(),
    }),
  },
  Map: {
    description: 'A map with markers. Use when a specific location or geographic area is central to the paragraph.',
    props: z.object({
      title: z.string(),
      center: z.tuple([z.number(), z.number()]),
      zoom: z.number(),
      markers: z.array(z.object({
        position: z.tuple([z.number(), z.number()]),
        label: z.string(),
      })),
    }),
  },
  QuoteHighlight: {
    description: 'A pulled quote with significance. Use rarely, only for genuinely pivotal quoted statements.',
    props: z.object({
      quote: z.string(),
      significance: z.string(),
    }),
  },
};

export const livingMarginRenderers = {
  BioCard,
  Chart,
  Map: MapComponent,
  QuoteHighlight,
};

export const livingMarginCatalog = createCatalog(
  livingMarginDefinitions,
  livingMarginRenderers,
  { catalogId: 'living-margin', includeBasicCatalog: true }
);
```

Registration in `apps/frontend/app/layout.tsx`:

```tsx
<CopilotKitProvider runtimeUrl="/api/copilotkit" a2ui={{ catalog: livingMarginCatalog }}>
  {children}
</CopilotKitProvider>
```

The catalog descriptions are auto-injected into the agent's system prompt via the kit's existing wiring; no manual prompt-stitching required.

## 9. Agent Prompt (`apps/agent/src/runtime.py`)

Replace the canvas-oriented system prompt with:

```
You are a document analysis agent. The user uploads a document; you decide, for each paragraph, whether it warrants ONE A2UI component from the catalog or none.

CRITICAL: Default to no component. Only emit a component when it adds real comprehension value an educated reader wouldn't already have. Empty margin is always better than a wrong component.

When called with a paragraph (currentBlock + previousBlocks for context), either:
1. Do nothing (no margin component for this paragraph), or
2. Call render_a2ui with exactly one component from the registered catalog.

The available components and their props are in the catalog descriptions above. Use them according to their stated guidance. For the Map component, latitude/longitude come from your world knowledge — no external lookups.
```

The catalog descriptions ride along automatically (kit's A2UI integration injects them).

## 10. API Endpoints

### `POST /api/parse` (new, in `apps/frontend`)
- Input: `multipart/form-data` with `file` (PDF).
- Server uses `pdfjs-dist` to extract text per page; `lib/pdfParse.ts` splits into paragraph blocks (`\n\n` boundaries, trim, drop empties).
- Output: `ParsedDocument` JSON.

### `POST /api/copilotkit` (existing in kit, unchanged)
- The CopilotKit runtime endpoint that bridges the frontend to the LangGraph agent in `apps/agent`. We don't modify this.

## 11. Frontend Behavior

### Layout
CSS grid, two columns (`grid-cols-[1fr_320px]`, `gap-8`). Each grid row = one paragraph. Right cell holds the margin slot. The kit's chat sidebar is hidden via CSS or by removing the chat component from `layout.tsx`.

### `app/page.tsx`
- Holds: `parsed: ParsedDocument | null`, `marginByBlockId: Record<string, RenderedComponent | undefined>`.
- Renders `<UploadZone>` if `parsed === null`, else `<DocumentViewer parsed={parsed} />`.

### `<UploadZone>`
- Drag-drop or file picker, accepts `.pdf`.
- POST to `/api/parse`, sets `parsed` on success.
- States: idle / "Parsing…" / "Ready".

### `<DocumentViewer>`
- Renders `parsed.blocks` as a 2-column grid.
- Each `<Paragraph>` row:
  - Left cell: `<p>` or `<h2>` per `block.type`, with `data-block-id={block.id}`.
  - Right cell: `<Margin block={block} />`.
  - On mount, an `IntersectionObserver` fires when the row enters the viewport. On fire, dispatch a CopilotKit invocation for this block's ID and the next 3 by index (skip if already in `marginByBlockId`).

### Per-paragraph dispatch
- Use CopilotKit's programmatic invocation (e.g., `useCopilotChat` headless API or `useCoAgent` action) to send a structured message: `{ blockId, currentText, previousTexts }`.
- The agent decides + calls `render_a2ui` (or doesn't).
- Rendered output lands in the slot via the A2UI catalog's automatic rendering pipeline. The `marginByBlockId` map tracks which blocks have been requested (for caching / dedup).

### `<Margin>`
- If no rendered component yet: render skeleton shimmer (`bg-zinc-100 animate-pulse h-20`).
- If the agent emitted a component: A2UI renders it inline.
- If the agent emitted nothing (decision to skip): clear the shimmer, render empty.

## 12. Margin Component Renderers

Every renderer:
- Single `props` object matching its Zod definition
- Outer card: `rounded-xl border border-zinc-200 bg-white p-4 shadow-sm`
- Tailwind transition for fade-in: starts `opacity-0`, becomes `opacity-100` after mount

Component-specific:
- **BioCard:** circular avatar with initials (color from a deterministic hash of `name`), bold name, muted role, 2-line description.
- **Chart:** Recharts `<ResponsiveContainer height={200}>`, bar or line per `chartType`, `unit` appended to tick labels.
- **MapComponent:** `react-leaflet` `<MapContainer style={{height:200}} center={center} zoom={zoom}>` (dynamic import with `ssr: false`), OpenStreetMap tiles, markers from `markers`.
- **QuoteHighlight:** large italic quote with a 4px left border, `significance` below in `text-sm text-zinc-500`.

## 13. Tier 2 — MCP-UI Image Card (build only if time)

When everything above works:

1. In `apps/mcp`, register a tool `generate_image_card(prompt: string)` that:
   - Hits Unsplash Source API: `https://source.unsplash.com/600x400/?{prompt}`
   - Returns a `UIResource` with HTML: `<img src="..."/><p class="caption">…</p>`
   - Uses `createUIResource()` per MCP Apps spec
2. In `apps/agent`, expose this tool to the LangGraph agent.
3. Update the system prompt: "When a paragraph mentions a visualizable thing (place, object, scene) and no other catalog component fits, you MAY call generate_image_card."
4. The frontend's `openGenerativeUI` surface (already wired by the kit) renders the sandboxed UIResource in the margin slot.

If time runs out, skip Tier 2 entirely. The 4 A2UI components alone are a complete demo.

## 14. Visual Design

- Palette: zinc neutrals; one accent per component type (blue=BioCard, purple=Chart, green=Map, amber=QuoteHighlight, rose=Image) used only on the card's left border or icon.
- Typography: `font-sans` (default) for UI, `font-serif` for document body.
- Spacing: `gap-y-8` between paragraph rows.

## 15. Out of Scope

- Word/.docx parsing
- Doc-type classification
- Model toggle (Gemini only, via the kit's runtime)
- Demo file buttons / `/public/demos/`
- Thumbnail collapse stack
- Framer Motion animations
- Authentication, persistence, sharing, mobile

## 16. Acceptance Criteria

- A user uploads a PDF and sees the document on the left.
- As they scroll, A2UI margin components appear on the right within ~2 seconds of a paragraph entering the viewport.
- Across a varied document, at least 2 of the 4 A2UI component types appear.
- A paragraph with nothing component-worthy gets no card (no shimmer left behind).
- No chat input is visible anywhere in the UI.

## 17. Build Order (2 hours)

1. **0:00–0:15** — Clone starter kit, install, configure `GOOGLE_API_KEY`, run `npm run dev`, verify canvas page loads. Hide chat sidebar.
2. **0:15–0:35** — `lib/pdfParse.ts` + `app/api/parse/route.ts` + `lib/types.ts`. Smoke-test by uploading a PDF and logging blocks.
3. **0:35–0:50** — Replace `app/page.tsx` with `<UploadZone>` + `<DocumentViewer>` rendering blocks in 2-col grid. No margin yet.
4. **0:50–1:10** — `lib/a2ui-catalog.ts` with 4 definitions + 4 renderers (stub renderers initially with placeholder HTML). Register catalog in `layout.tsx`.
5. **1:10–1:25** — Modify `apps/agent/src/runtime.py` system prompt. Wire per-paragraph dispatch from `<DocumentViewer>` via CopilotKit's headless API + IntersectionObserver. Smoke-test that the agent receives a paragraph and emits an A2UI call.
6. **1:25–1:55** — Flesh out renderers in this order (cheapest first): QuoteHighlight → BioCard → Chart (Recharts) → MapComponent (react-leaflet, dynamic import).
7. **1:55–2:00** — Smoke test on a real PDF, fix obvious breaks.
8. **If time:** Tier 2 — MCP-UI image card per §13.

## 18. Environment

```
GOOGLE_API_KEY=...    # Gemini 3.1 Flash-Lite via the kit's runtime
# Plus whatever else the starter kit's .env.example requires
```

## 19. Risks & Mitigations

- **CopilotKit headless invocation API may differ from what's described** — read kit's existing canvas wiring at clone time and mirror its pattern. The kit already does per-event agent invocations for canvas cards; same pattern applies per paragraph.
- **Python agent edits require a Python toolchain** — kit handles this; just `pip install -r` and edit the prompt.
- **react-leaflet SSR issue** — always `dynamic(() => import(...), { ssr: false })`.
- **Tier 2 is genuinely optional** — the 4 A2UI components are the demo. Cut Tier 2 the moment the clock crosses 1:55.
