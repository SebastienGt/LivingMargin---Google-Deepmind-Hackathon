import type { ImageProps } from "@/lib/a2ui-schemas";

export function Image({ data }: { data: ImageProps }) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    data.query,
  )}?width=600&height=400&nologo=true`;
  return (
    <div>
      <div
        className="aspect-[3/2] w-full bg-stone-100 bg-cover bg-center"
        style={{ backgroundImage: `url(${url})` }}
        role="img"
        aria-label={data.caption}
      />
      <p className="px-4 py-3 text-xs leading-relaxed text-stone-600">
        {data.caption}
      </p>
    </div>
  );
}
