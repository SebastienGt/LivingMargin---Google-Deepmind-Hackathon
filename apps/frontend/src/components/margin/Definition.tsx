import type { DefinitionProps } from "@/lib/a2ui-schemas";
import { BookOpen } from "lucide-react";

export function Definition({ data }: { data: DefinitionProps }) {
  return (
    <div className="p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-rose-500">
        <BookOpen className="h-3 w-3" />
        Definition
      </div>
      <p className="font-semibold text-stone-900">{data.term}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
        {data.definition}
      </p>
    </div>
  );
}
