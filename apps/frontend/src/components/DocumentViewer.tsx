"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  const onParagraphInView = useCallback(
    (block: DocumentBlock) => {
      // Fetch this block + next 3 (prefetch ahead)
      const targets = [
        block,
        parsed.blocks[block.index + 1],
        parsed.blocks[block.index + 2],
        parsed.blocks[block.index + 3],
      ].filter((b): b is DocumentBlock => Boolean(b));
      for (const t of targets) fetchBlock(t);
    },
    [parsed.blocks, fetchBlock],
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 md:px-12">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            livingMargin
          </p>
          <h1 className="text-lg font-semibold text-zinc-900 line-clamp-1">
            {parsed.title}
          </h1>
        </div>
        <button
          onClick={onReset}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50"
        >
          Upload another
        </button>
      </header>

      <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-8 grid-cols-1 lg:grid-cols-[1fr_320px]">
        {parsed.blocks.map((block) => (
          <ParagraphRow
            key={block.id}
            block={block}
            slot={slots[block.id]}
            onInView={onParagraphInView}
          />
        ))}
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
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [block, onInView]);

  return (
    <>
      <div ref={ref} data-block-id={block.id}>
        {block.type === "heading" ? (
          <h2 className="font-serif text-2xl font-semibold text-zinc-900 leading-tight">
            {block.text}
          </h2>
        ) : (
          <p className="font-serif text-base text-zinc-800 leading-relaxed">
            {block.text}
          </p>
        )}
      </div>
      <div className="lg:pl-2">
        <Margin
          status={slot?.status ?? "idle"}
          component={slot?.component ?? null}
        />
      </div>
    </>
  );
}
