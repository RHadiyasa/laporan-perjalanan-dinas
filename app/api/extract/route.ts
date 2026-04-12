import { NextRequest } from "next/server";
import { extractFromInvitation } from "@/lib/claude";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).imageBase64 !== "string" ||
    typeof (body as Record<string, unknown>).mimeType !== "string"
  ) {
    return Response.json(
      { error: "Body must contain imageBase64 (string) and mimeType (string)." },
      { status: 400 }
    );
  }

  const { imageBase64, mimeType } = body as {
    imageBase64: string;
    mimeType: string;
  };

  if (!imageBase64.trim()) {
    return Response.json({ error: "imageBase64 must not be empty." }, { status: 400 });
  }

  try {
    const extracted = await extractFromInvitation(imageBase64, mimeType);
    return Response.json(extracted);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return Response.json({ error: message }, { status: 502 });
  }
}
