import { extractText, getDocumentProxy } from "unpdf";
import type { DocumentBlock, ParsedDocument } from "./types";

export async function parsePdf(buffer: ArrayBuffer): Promise<ParsedDocument> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const fullText = Array.isArray(text) ? text.join("\n\n") : text;

  const rawBlocks = fullText
    .split(/\n\s*\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);

  const blocks: DocumentBlock[] = rawBlocks.map((paragraph, i) => {
    const isHeading =
      paragraph.length < 80 &&
      /^[A-Z0-9]/.test(paragraph) &&
      !paragraph.endsWith(".") &&
      !paragraph.endsWith(",");
    return {
      id: `block-${i}`,
      index: i,
      text: paragraph,
      type: isHeading ? "heading" : "paragraph",
    };
  });

  const title = blocks[0]?.text.slice(0, 80) || "Untitled document";

  return { title, blocks };
}
