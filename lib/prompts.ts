import type { ExtractedData } from "@/types/report";

export const EXTRACT_SYSTEM_PROMPT = `You are a data extraction assistant for Indonesian government documents.
Extract information from the invitation letter image and respond ONLY with valid JSON — no explanation, no markdown, no code fences.
All values must be strings. If a field is not found, use an empty string.`;

export const EXTRACT_USER_PROMPT = `Extract the following fields from this invitation letter image and return them as a JSON object:

{
  "perihal": "subject/topic of the meeting (field 'Perihal' or 'Hal')",
  "tempat": "location/venue of the meeting",
  "hariTanggal": "day and date of the meeting (e.g. 'Selasa, 10 Desember 2024')",
  "waktu": "time of the meeting (e.g. '09.00 WIB')",
  "nomorSuratUndangan": "letter number (field 'Nomor' or 'No.')",
  "tanggalSuratUndangan": "date the letter was issued",
  "pengirim": "name of the institution or person who sent the letter",
  "agenda": "detailed agenda or purpose of the meeting"
}

Respond ONLY with the JSON object. No other text.`;

export function buildNarrativeSystemPrompt(): string {
  return `You are a formal Indonesian government report writer for Kementerian Energi dan Sumber Daya Mineral (ESDM).
Write in formal Indonesian language (Bahasa Indonesia formal/baku) following standard government report style.
Respond ONLY with valid JSON — no explanation, no markdown, no code fences.`;
}

export function buildNarrativeUserPrompt(
  extracted: ExtractedData,
  transcript: string
): string {
  return `Based on the meeting details and transcript below, generate a formal government travel report narrative.

MEETING DETAILS:
- Perihal: ${extracted.perihal}
- Tempat: ${extracted.tempat}
- Hari/Tanggal: ${extracted.hariTanggal}
- Waktu: ${extracted.waktu}
- Nomor Surat Undangan: ${extracted.nomorSuratUndangan}
- Tanggal Surat Undangan: ${extracted.tanggalSuratUndangan}
- Pengirim: ${extracted.pengirim}
- Agenda: ${extracted.agenda}

TRANSCRIPT / MEETING NOTES:
${transcript}

Return a JSON object with exactly these fields:

{
  "dasarPenugasan": "A formal 1–2 sentence paragraph referencing the invitation letter by its number, date, and subject. Example: 'Berdasarkan Surat Undangan dari [pengirim] Nomor [nomor] tanggal [tanggal] perihal [perihal], maka dilaksanakan kegiatan...'",
  "partisipanKegiatan": ["Array of strings, each representing a participant group or institution present at the meeting, extracted from the transcript. E.g. 'Perwakilan Direktorat Jenderal Ketenagalistrikan', 'Tim dari PT PLN (Persero)'"],
  "hasilPembahasan": "A formal multi-paragraph narrative of the meeting outcomes and discussions, written in formal Indonesian government style. Each paragraph separated by \\n\\n. Summarise key points, decisions, and follow-up actions from the transcript."
}

Respond ONLY with the JSON object. No other text.`;
}
