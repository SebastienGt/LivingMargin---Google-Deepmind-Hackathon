import type { BioCardProps } from "@/lib/a2ui-schemas";

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const palette = [
    "#0ea5e9",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
  ];
  return palette[hash % palette.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function BioCard({ data }: { data: BioCardProps }) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: colorFromName(data.name) }}
        >
          {initials(data.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-stone-900">{data.name}</p>
          <p className="truncate text-xs uppercase tracking-wide text-stone-500">
            {data.role}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-700">
        {data.description}
      </p>
    </div>
  );
}
