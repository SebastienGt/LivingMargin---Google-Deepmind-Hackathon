"use client";

import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { DocumentViewer } from "@/components/DocumentViewer";
import type { ParsedDocument } from "@/lib/types";

export default function HomePage() {
  const [parsed, setParsed] = useState<ParsedDocument | null>(null);

  if (!parsed) {
    return <UploadZone onParsed={setParsed} />;
  }
  return (
    <DocumentViewer parsed={parsed} onReset={() => setParsed(null)} />
  );
}
