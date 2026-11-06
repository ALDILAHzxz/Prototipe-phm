import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Peringatan: GEMINI_API_KEY belum disetel di environment variables.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

export async function POST(req: Request) {
  try {
    const { prompt, systemInstruction } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt wajib diisi." },
        { status: 400 }
      );
    }

    // Default model menggunakan gemini-2.5-flash (model cepat dan cerdas)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || undefined,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      text: response.text,
    });
  } catch (error: any) {
    console.error("Error memanggil Gemini API:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses permintaan ke Gemini API." },
      { status: 500 }
    );
  }
}

