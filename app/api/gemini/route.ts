import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Batas ukuran agar endpoint tidak disalahgunakan sebagai proxy AI umum.
const MAX_PROMPT_CHARS = 1_000;
const MAX_CONTEXT_CHARS = 20_000;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/** Status jujur: apakah kunci Gemini dipasang di server. Tidak membocorkan kuncinya. */
export async function GET() {
  return NextResponse.json({ configured: !!process.env.GEMINI_API_KEY });
}

export async function POST(req: Request) {
  const ai = getClient();
  if (!ai) {
    return NextResponse.json(
      { error: "Gemini AI belum dikonfigurasi di server (GEMINI_API_KEY kosong).", code: "not_configured" },
      { status: 503 }
    );
  }

  let body: { prompt?: unknown; systemInstruction?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const systemInstruction = typeof body.systemInstruction === "string" ? body.systemInstruction : undefined;

  if (!prompt) {
    return NextResponse.json({ error: "Pertanyaan wajib diisi." }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_CHARS || (systemInstruction?.length ?? 0) > MAX_CONTEXT_CHARS) {
    return NextResponse.json({ error: "Pertanyaan atau konteks terlalu panjang." }, { status: 413 });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });
    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Gagal memanggil Gemini API:", error);
    return NextResponse.json({ error: "Layanan Gemini AI sedang tidak dapat dihubungi." }, { status: 502 });
  }
}
