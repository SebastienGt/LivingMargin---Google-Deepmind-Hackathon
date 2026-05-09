"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { AgentResponse, MarginComponent } from "@/lib/types";

interface SelectionState {
  rect: DOMRect;
  blockId: string;
  text: string;
}

export function SelectionExplorer({
  onAppend,
}: {
  onAppend: (blockId: string, comps: MarginComponent[]) => void;
}) {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const text = sel.toString().trim();
      if (text.length < 6) {
        setSelection(null);
        return;
      }
      const node =
        range.startContainer.nodeType === Node.TEXT_NODE
          ? range.startContainer.parentElement
          : (range.startContainer as Element);
      const blockEl = node?.closest?.("[data-block-id]") as HTMLElement | null;
      if (!blockEl) {
        setSelection(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      setSelection({
        rect,
        blockId: blockEl.dataset.blockId!,
        text,
      });
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  // Hide on outside click (but not when clicking the button itself).
  useEffect(() => {
    if (!selection) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      // Let the browser update selection first; if still collapsed, hide.
      setTimeout(() => {
        const s = window.getSelection();
        if (!s || s.isCollapsed) setSelection(null);
      }, 0);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [selection]);

  const explore = async () => {
    if (!selection || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: selection.blockId,
          currentText: selection.text,
          previousTexts: [],
          desiredCount: 4,
        }),
      });
      const json: AgentResponse = await res.json();
      if (json.components?.length) {
        onAppend(selection.blockId, json.components);
      }
    } finally {
      setLoading(false);
      window.getSelection()?.removeAllRanges();
      setSelection(null);
    }
  };

  if (!selection) return null;

  const top = selection.rect.bottom + window.scrollY + 8;
  const left =
    selection.rect.left + window.scrollX + selection.rect.width / 2;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed z-50"
      style={{
        top: `${top - window.scrollY}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={explore}
        disabled={loading}
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-stone-800 transition hover:bg-stone-700 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {loading ? "researching…" : "Explore selection"}
      </button>
    </div>
  );
}
