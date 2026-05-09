import type { BioCardProps } from "@/lib/a2ui-catalog";

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const palette = [
    "#3b82f6",
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
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: colorFromName(data.name) }}
        >
          {initials(data.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900">{data.name}</p>
          <p className="truncate text-xs text-zinc-500">{data.role}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-700 leading-relaxed line-clamp-3">
        {data.description}
      </p>
    </div>
  );
}
