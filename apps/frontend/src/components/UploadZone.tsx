"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-zinc-900">livingMargin</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Upload a PDF. The agent generates interactive components in the
            margin, paragraph by paragraph.
          </p>
        </div>

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
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-white px-8 py-16 text-center transition ${
            dragActive
              ? "border-zinc-900 bg-zinc-100"
              : "border-zinc-300 hover:border-zinc-400"
          }`}
        >
          <Upload className="h-8 w-8 text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-900">
              Drop a PDF here, or click to choose
            </p>
            <p className="mt-1 text-xs text-zinc-500">.pdf only · up to 10MB</p>
          </div>
          <input
            id="file-input"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>

        {status === "parsing" && (
          <p className="mt-4 text-center text-sm text-zinc-500">
            Parsing document…
          </p>
        )}
        {status === "error" && error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </main>
  );
}
