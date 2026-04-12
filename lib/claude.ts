import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedData, GeneratedNarrative } from "@/types/report";
import {
  EXTRACT_SYSTEM_PROMPT,
  EXTRACT_USER_PROMPT,
  buildNarrativeSystemPrompt,
  buildNarrativeUserPrompt,
} from "@/lib/prompts";

const MODEL = "claude-sonnet-4-20250514";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set.");
  }
  return new Anthropic({ apiKey });
}

function parseJsonResponse<T>(raw: string, context: string): T {
  // Strip markdown code fences if the model ignores the system prompt
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse ${context} response as JSON.\nRaw response:\n${raw}`
    );
  }
}

function validateExtractedData(data: unknown): ExtractedData {
  const required: (keyof ExtractedData)[] = [
    "perihal",
    "tempat",
    "hariTanggal",
    "waktu",
    "nomorSuratUndangan",
    "tanggalSuratUndangan",
    "pengirim",
    "agenda",
  ];

  if (typeof data !== "object" || data === null) {
    throw new Error("Extracted data is not an object.");
  }

  const obj = data as Record<string, unknown>;
  const result: Partial<ExtractedData> = {};

  for (const key of required) {
    // Coerce missing or non-string values to empty string rather than crashing
    result[key] = typeof obj[key] === "string" ? (obj[key] as string) : "";
  }

  return result as ExtractedData;
}

function validateNarrative(data: unknown): GeneratedNarrative {
  if (typeof data !== "object" || data === null) {
    throw new Error("Narrative data is not an object.");
  }

  const obj = data as Record<string, unknown>;

  const dasarPenugasan =
    typeof obj.dasarPenugasan === "string" ? obj.dasarPenugasan : "";

  const hasilPembahasan =
    typeof obj.hasilPembahasan === "string" ? obj.hasilPembahasan : "";

  const partisipanKegiatan = Array.isArray(obj.partisipanKegiatan)
    ? (obj.partisipanKegiatan as unknown[])
        .filter((v) => typeof v === "string")
        .map((v) => v as string)
    : [];

  return { dasarPenugasan, partisipanKegiatan, hasilPembahasan };
}

/**
 * Uses Claude Vision to extract structured data from an invitation letter image.
 */
export async function extractFromInvitation(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedData> {
  const client = getClient();

  const validMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
  type ImageMime = typeof validMimeTypes[number];

  if (!validMimeTypes.includes(mimeType as ImageMime)) {
    throw new Error(`Unsupported image MIME type: ${mimeType}`);
  }

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: EXTRACT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as ImageMime,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: EXTRACT_USER_PROMPT,
            },
          ],
        },
      ],
    });
  } catch (err) {
    throw new Error(
      `Visa Vision API call failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude Vision returned no text content.");
  }

  const parsed = parseJsonResponse<unknown>(textBlock.text, "extraction");
  return validateExtractedData(parsed);
}

/**
 * Uses Claude Text to generate a formal Indonesian government report narrative.
 */
export async function generateNarrative(
  extracted: ExtractedData,
  transcript: string
): Promise<GeneratedNarrative> {
  const client = getClient();

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: buildNarrativeSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildNarrativeUserPrompt(extracted, transcript),
        },
      ],
    });
  } catch (err) {
    throw new Error(
      `Visa Text API call failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude Text returned no text content.");
  }

  const parsed = parseJsonResponse<unknown>(textBlock.text, "narrative");
  return validateNarrative(parsed);
}
