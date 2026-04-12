import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { buildReport, type ImageBuffers } from "@/lib/docx-builder";
import { generateFileName } from "@/lib/file-naming";
import type { ReportData, ExtractedData, GeneratedNarrative } from "@/types/report";

// ── Request body shape ─────────────────────────────────────────────────────────
// Images are passed as base64 strings because they live as blob-URLs in the
// browser and were never uploaded to the server.

interface GenerateDocxBody {
  extracted: ExtractedData;
  narrative: GeneratedNarrative;
  nomorSuratTugas: string;
  tanggalSuratTugas: string;
  unitKerja: string;
  tempatPelaksanaan: string;
  transcript: string;
  images: {
    undangan: string; // base64
    fotoKegiatan: string[]; // base64[]
    daftarHadir: string[]; // base64[]
    materiPresentasi: string[]; // base64[]
  };
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function validateBody(body: unknown): body is GenerateDocxBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;

  if (
    typeof b.extracted !== "object" ||
    b.extracted === null ||
    typeof b.narrative !== "object" ||
    b.narrative === null
  )
    return false;

  if (
    !isString(b.nomorSuratTugas) ||
    !isString(b.tanggalSuratTugas) ||
    !isString(b.unitKerja) ||
    !isString(b.tempatPelaksanaan) ||
    !isString(b.transcript)
  )
    return false;

  if (typeof b.images !== "object" || b.images === null) return false;
  const imgs = b.images as Record<string, unknown>;

  if (
    !isString(imgs.undangan) ||
    !isStringArray(imgs.fotoKegiatan) ||
    !isStringArray(imgs.daftarHadir) ||
    !isStringArray(imgs.materiPresentasi)
  )
    return false;

  if (!imgs.undangan) return false;
  if ((imgs.fotoKegiatan as string[]).length === 0) return false;
  if ((imgs.daftarHadir as string[]).length === 0) return false;

  return true;
}

function b64ToBuffer(base64: string): Buffer {
  // Strip optional data-URI prefix "data:<mime>;base64,"
  const comma = base64.indexOf(",");
  const data = comma !== -1 ? base64.slice(comma + 1) : base64;
  return Buffer.from(data, "base64");
}

export async function POST(req: NextRequest) {
  // ── Parse body ──
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!validateBody(body)) {
    return Response.json(
      {
        error:
          "Body must contain extracted, narrative, metadata fields, and images " +
          "(undangan, fotoKegiatan[], daftarHadir[] as base64 strings).",
      },
      { status: 400 }
    );
  }

  // ── Convert base64 → Buffers ──
  const imageBuffers: ImageBuffers = {
    logo: Buffer.alloc(0), // filled below
    undangan: b64ToBuffer(body.images.undangan),
    fotoKegiatan: body.images.fotoKegiatan.map(b64ToBuffer),
    daftarHadir: body.images.daftarHadir.map(b64ToBuffer),
    materiPresentasi: body.images.materiPresentasi.map(b64ToBuffer),
  };

  // ── Read logo from public/assets ──
  // Try PNG first (future-proof), fall back to the SVG that ships in the repo.
  const assetsDir = path.join(process.cwd(), "public", "assets");

  try {
    try {
      imageBuffers.logo = await readFile(path.join(assetsDir, "logo-esdm.png"));
    } catch {
      // PNG not found — use the SVG (docx-builder embeds it with a PNG fallback)
      const svgFile = path.join(
        assetsDir,
        "Logo_Kementerian_Energi_dan_Sumber_Daya_Mineral_Republik_Indonesia_(2025)_(full_version).svg"
      );
      imageBuffers.logo = await readFile(svgFile);
    }
  } catch {
    return Response.json(
      { error: "Logo file not found in public/assets/." },
      { status: 500 }
    );
  }

  // ── Assemble ReportData ──
  const reportData: ReportData = {
    extracted: body.extracted,
    narrative: body.narrative,
    nomorSuratTugas: body.nomorSuratTugas,
    tanggalSuratTugas: body.tanggalSuratTugas,
    unitKerja: body.unitKerja,
    tempatPelaksanaan: body.tempatPelaksanaan,
    transcript: body.transcript,
    files: {
      undangan: "",
      fotoKegiatan: [],
      daftarHadir: [],
      materiPresentasi: [],
    },
  };

  // ── Build docx ──
  let docxBuffer: Buffer;
  try {
    docxBuffer = await buildReport(reportData, imageBuffers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Document generation failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  // ── Generate filename ──
  const baseName = generateFileName(
    body.extracted.hariTanggal,
    body.extracted.perihal
  );
  // Sanitise: remove characters that cause issues in Content-Disposition headers
  const safeName = baseName.replace(/[^\w\s\-_.()]/g, "").trim();
  const filename = `${safeName}.docx`;

  // ── Return as downloadable file ──
  return new Response(docxBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(docxBuffer.length),
    },
  });
}
