import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) {
    return new Response("Missing q", { status: 400 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return new Response("GEMINI_API_KEY not set", { status: 500 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
  const prompt = `Generate a vivid editorial illustration of: ${q}. Painterly, atmospheric, high-detail, no text or watermarks.`;

  const result = await model.generateContent(prompt);
  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find(
    (p) =>
      "inlineData" in p &&
      p.inlineData?.data &&
      p.inlineData.mimeType?.startsWith("image/"),
  );
  if (!image || !("inlineData" in image) || !image.inlineData) {
    return new Response("No image returned", { status: 502 });
  }

  const bytes = Buffer.from(image.inlineData.data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": image.inlineData.mimeType ?? "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
