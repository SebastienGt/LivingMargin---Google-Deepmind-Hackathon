import type { FactProps } from "@/lib/a2ui-catalog";

export function Fact({ data }: { data: FactProps }) {
  return (
    <div className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-cyan-600">
        {data.label}
      </p>
      <p className="mt-1 font-serif text-3xl font-semibold leading-none text-stone-900">
        {data.value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-stone-600">
        {data.context}
      </p>
    </div>
  );
}
