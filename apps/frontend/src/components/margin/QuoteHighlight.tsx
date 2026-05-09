import type { QuoteHighlightProps } from "@/lib/a2ui-catalog";

export function QuoteHighlight({ data }: { data: QuoteHighlightProps }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="border-l-4 border-amber-400 pl-3">
        <p className="font-serif italic text-zinc-800 leading-snug">
          &ldquo;{data.quote}&rdquo;
        </p>
      </div>
      <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
        {data.significance}
      </p>
    </div>
  );
}
