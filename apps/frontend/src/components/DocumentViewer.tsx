"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type {
  AgentResponse,
  DocumentBlock,
  MarginComponent,
  ParsedDocument,
} from "@/lib/types";
import { Margin } from "./Margin";

type SlotStatus = "idle" | "pending" | "ready";

interface SlotState {
  status: SlotStatus;
  component: MarginComponent | null;
}

const PRELOAD_COUNT = 10;
const PREFETCH_AHEAD = 4;

export function DocumentViewer({
  parsed,
  onReset,
}: {
  parsed: ParsedDocument;
  onReset: () => void;
}) {
  const [slots, setSlots] = useState<Record<string, SlotState>>({});
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const fetchBlock = useCallback(
    async (block: DocumentBlock) => {
      if (slotsRef.current[block.id]) return;

      setSlots((prev) => ({
        ...prev,
        [block.id]: { status: "pending", component: null },
      }));

      const previousTexts = parsed.blocks
        .slice(Math.max(0, block.index - 2), block.index)
        .map((b) => b.text);

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: block.id,
            currentText: block.text,
            previousTexts,
          }),
        });
        const json: AgentResponse = await res.json();
        setSlots((prev) => ({
          ...prev,
          [block.id]: {
            status: "ready",
            component: json.component ?? null,
          },
        }));
      } catch {
        setSlots((prev) => ({
          ...prev,
          [block.id]: { status: "ready", component: null },
        }));
      }
    },
    [parsed.blocks],
  );

  // Preload the first PRELOAD_COUNT blocks immediately on document load.
  useEffect(() => {
    const initial = parsed.blocks.slice(0, PRELOAD_COUNT);
    for (const b of initial) fetchBlock(b);
  }, [parsed.blocks, fetchBlock]);

  const onParagraphInView = useCallback(
    (block: DocumentBlock) => {
      const targets: DocumentBlock[] = [];
      for (let i = 0; i <= PREFETCH_AHEAD; i++) {
        const next = parsed.blocks[block.index + i];
        if (next) targets.push(next);
      }
      for (const t of targets) fetchBlock(t);
    },
    [parsed.blocks, fetchBlock],
  );

  const stats = useMemo(() => {
    const total = parsed.blocks.length;
    let analyzed = 0;
    let withComponent = 0;
    for (const b of parsed.blocks) {
      const s = slots[b.id];
      if (s?.status === "ready") {
        analyzed += 1;
        if (s.component) withComponent += 1;
      }
    }
    return { total, analyzed, withComponent };
  }, [parsed.blocks, slots]);

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-[#fafaf7]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-8 py-4">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:border-stone-500 hover:bg-stone-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            New document
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-widest text-stone-400">
              livingMargin
            </p>
            <h1 className="truncate font-serif text-lg font-semibold text-stone-900">
              {parsed.title}
            </h1>
          </div>
          <div className="hidden items-center gap-4 text-xs text-stone-500 md:flex">
            {stats.analyzed < stats.total && (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                analyzing&hellip;
              </span>
            )}
            <span>
              <span className="font-semibold text-stone-700">
                {stats.analyzed}
              </span>
              <span className="text-stone-400"> / {stats.total} </span>
              paragraphs
            </span>
            <span>
              <span className="font-semibold text-stone-700">
                {stats.withComponent}
              </span>
              <span className="text-stone-400"> components</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-8 py-12">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[1fr_440px]">
          {parsed.blocks.map((block) => (
            <ParagraphRow
              key={block.id}
              block={block}
              slot={slots[block.id]}
              onInView={onParagraphInView}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function ParagraphRow({
  block,
  slot,
  onInView,
}: {
  block: DocumentBlock;
  slot: SlotState | undefined;
  onInView: (block: DocumentBlock) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            onInView(block);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [block, onInView]);

  return (
    <>
      <div ref={ref} data-block-id={block.id} className="max-w-prose">
        {block.type === "heading" ? (
          <h2 className="font-serif text-3xl font-semibold leading-tight text-stone-900">
            {block.text}
          </h2>
        ) : (
          <p className="font-serif text-[17px] leading-[1.75] text-stone-800">
            {block.text}
          </p>
        )}
      </div>
      <div>
        <Margin
          status={slot?.status ?? "idle"}
          component={slot?.component ?? null}
        />
      </div>
    </>
  );
}
