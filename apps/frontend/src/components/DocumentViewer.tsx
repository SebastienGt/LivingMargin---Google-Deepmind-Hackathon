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
import { SelectionExplorer } from "./SelectionExplorer";

type SlotStatus = "idle" | "pending" | "ready";

interface SlotState {
  status: SlotStatus;
  components: MarginComponent[];
}

const CONCURRENCY = 6;

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
        [block.id]: { status: "pending", components: [] },
      }));

      const previousTexts = parsed.blocks
        .slice(Math.max(0, block.index - 2), block.index)
        .map((b) => b.text);

      const wordCount = block.text.trim().split(/\s+/).length;
      const desiredCount = Math.min(7, Math.max(4, Math.ceil(wordCount / 18)));

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blockId: block.id,
            currentText: block.text,
            previousTexts,
            desiredCount,
          }),
        });
        const json: AgentResponse = await res.json();
        setSlots((prev) => ({
          ...prev,
          [block.id]: {
            status: "ready",
            components: json.components ?? [],
          },
        }));
      } catch {
        setSlots((prev) => ({
          ...prev,
          [block.id]: { status: "ready", components: [] },
        }));
      }
    },
    [parsed.blocks],
  );

  useEffect(() => {
    let cancelled = false;
    const queue = [...parsed.blocks];
    let active = 0;

    const pump = () => {
      while (!cancelled && active < CONCURRENCY && queue.length > 0) {
        const next = queue.shift()!;
        active += 1;
        fetchBlock(next).finally(() => {
          active -= 1;
          if (!cancelled) pump();
        });
      }
    };
    pump();
    return () => {
      cancelled = true;
    };
  }, [parsed.blocks, fetchBlock]);

  const appendComponents = useCallback(
    (blockId: string, comps: MarginComponent[]) => {
      setSlots((prev) => {
        const existing = prev[blockId] ?? {
          status: "ready" as const,
          components: [],
        };
        return {
          ...prev,
          [blockId]: {
            status: "ready",
            components: [...comps, ...existing.components],
          },
        };
      });
    },
    [],
  );

  const stats = useMemo(() => {
    const total = parsed.blocks.length;
    let analyzed = 0;
    let componentCount = 0;
    for (const b of parsed.blocks) {
      const s = slots[b.id];
      if (s?.status === "ready") {
        analyzed += 1;
        componentCount += s.components.length;
      }
    }
    return { total, analyzed, componentCount };
  }, [parsed.blocks, slots]);

  return (
    <main className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#fafaf7]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-8 py-4">
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
                {stats.componentCount}
              </span>
              <span className="text-stone-400"> components</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-8 py-12">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_460px]">
          {parsed.blocks.map((block) => (
            <ParagraphRow
              key={block.id}
              block={block}
              slot={slots[block.id]}
            />
          ))}
        </div>
      </div>
      <SelectionExplorer onAppend={appendComponents} />
    </main>
  );
}

function ParagraphRow({
  block,
  slot,
}: {
  block: DocumentBlock;
  slot: SlotState | undefined;
}) {
  return (
    <>
      <div data-block-id={block.id} className="max-w-prose">
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
      <div className="flex flex-col gap-4">
        <Margin
          status={slot?.status ?? "idle"}
          components={slot?.components ?? []}
        />
      </div>
    </>
  );
}
