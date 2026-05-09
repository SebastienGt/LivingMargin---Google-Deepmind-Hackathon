"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ImageProps } from "@/lib/a2ui-schemas";

export function Image({ data }: { data: ImageProps }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const url = `/api/image?q=${encodeURIComponent(data.query)}`;

  return (
    <div>
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-stone-100">
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 to-stone-100">
            <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
          </div>
        )}
        {errored ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">
            image unavailable
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={data.caption}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
      <p className="px-4 py-3 text-xs leading-relaxed text-stone-600">
        {data.caption}
      </p>
    </div>
  );
}
