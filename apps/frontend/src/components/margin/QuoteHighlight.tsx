import type { QuoteHighlightProps } from "@/lib/a2ui-schemas";
import { Quote } from "lucide-react";

export function QuoteHighlight({ data }: { data: QuoteHighlightProps }) {
  return (
    <div className="p-5">
      <Quote className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
      <p className="mt-2 font-serif text-lg italic leading-snug text-stone-800">
        {data.quote}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-stone-500">
        {data.significance}
      </p>
    </div>
  );
}
