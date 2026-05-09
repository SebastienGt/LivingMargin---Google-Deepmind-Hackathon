export interface DocumentBlock {
  id: string;
  index: number;
  text: string;
  type: "paragraph" | "heading";
}

export interface ParsedDocument {
  title: string;
  blocks: DocumentBlock[];
}

export type ComponentType =
  | "bio-card"
  | "chart"
  | "map"
  | "quote-highlight"
  | "image"
  | "definition"
  | "fact";

export interface MarginComponent {
  type: ComponentType;
  data: unknown;
}

export interface AgentResponse {
  blockId: string;
  components: MarginComponent[];
}
