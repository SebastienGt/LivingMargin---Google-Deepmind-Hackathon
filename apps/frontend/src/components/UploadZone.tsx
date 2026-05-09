"use client";

import { useState } from "react";
import { FileText, Sparkles, Upload } from "lucide-react";
import type { ParsedDocument } from "@/lib/types";

export function UploadZone({
  onParsed,
}: {
  onParsed: (parsed: ParsedDocument) => void;
}) {
  const [status, setStatus] = useState<"idle" | "parsing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  async function handleFile(file: File) {
    setStatus("parsing");
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Parse failed (${res.status})`);
      }
      const parsed: ParsedDocument = await res.json();
      onParsed(parsed);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
      setStatus("error");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafaf7]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,120,80,0.08),_transparent_50%),_radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.06),_transparent_50%)]"
      />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-stone-600 backdrop-blur">
          <Sparkles className="h-3 w-3" />
          Generative UI · A2UI
        </div>

        <h1 className="mt-6 text-center font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-stone-900 md:text-6xl">
          The margin,
          <br />
          <span className="italic text-stone-500">reimagined.</span>
        </h1>

        <p className="mt-6 max-w-xl text-center text-base leading-relaxed text-stone-600">
          Upload a PDF. As you read, an AI agent generates interactive maps,
          charts, bios, and quotes alongside each paragraph &mdash; a living
          margin that thinks with you.
        </p>

        <label
          htmlFor="file-input"
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`group mt-12 flex w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-white/70 px-10 py-14 text-center shadow-[0_2px_24px_rgba(0,0,0,0.04)] backdrop-blur transition ${
            dragActive
              ? "border-stone-900 bg-white scale-[1.01]"
              : "border-stone-300 hover:border-stone-500 hover:bg-white"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm transition group-hover:scale-105">
            {status === "parsing" ? (
              <FileText className="h-6 w-6 animate-pulse" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-base font-medium text-stone-900">
              {status === "parsing"
                ? "Parsing your document…"
                : "Drop a PDF here, or click to choose"}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              .pdf only &middot; up to 10MB
            </p>
          </div>
          <input
            id="file-input"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={status === "parsing"}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>

        {status === "error" && error && (
          <p className="mt-4 max-w-xl rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="mt-12 text-xs text-stone-400">
          Built on Gemini 2.5 Flash &middot; A2UI catalog &middot; Next.js 15
        </p>
      </div>
    </main>
  );
}
