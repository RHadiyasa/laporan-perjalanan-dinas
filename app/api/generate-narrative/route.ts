import { NextRequest } from "next/server";
import { generateNarrative } from "@/lib/claude";
import type { ExtractedData } from "@/types/report";

const EXTRACTED_KEYS: (keyof ExtractedData)[] = [
  "perihal",
  "tempat",
  "hariTanggal",
  "waktu",
  "nomorSuratUndangan",
  "tanggalSuratUndangan",
  "pengirim",
  "agenda",
];

function isValidExtractedData(value: unknown): value is ExtractedData {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return EXTRACTED_KEYS.every((key) => typeof obj[key] === "string");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Body must be a JSON object." }, { status: 400 });
  }

  const { extracted, transcript } = body as Record<string, unknown>;

  if (!isValidExtractedData(extracted)) {
    return Response.json(
      {
        error:
          "Body must contain an 'extracted' object with all ExtractedData fields as strings.",
      },
      { status: 400 }
    );
  }

  if (typeof transcript !== "string" || !transcript.trim()) {
    return Response.json(
      { error: "Body must contain a non-empty 'transcript' string." },
      { status: 400 }
    );
  }

  try {
    const narrative = await generateNarrative(extracted, transcript);
    return Response.json(narrative);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return Response.json({ error: message }, { status: 502 });
  }
}
