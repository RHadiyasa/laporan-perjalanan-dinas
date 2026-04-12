# Report Generator

Next.js 14 web app that generates "Laporan Pelaksanaan Perjalanan Dinas" (.docx) from uploaded images and meeting transcripts using Claude AI Vision + Text. Output is a downloadable .docx file.

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run type-check` — TypeScript strict check

## Tech Stack

- Next.js 14 App Router, TypeScript strict, Tailwind CSS
- Zustand for state management
- `docx` (npm) for .docx generation
- `@anthropic-ai/sdk` for Claude API (Vision + Text)
- `formidable` for file upload parsing
- No database — stateless, files in `/tmp` during processing

## Architecture

```
app/
├── page.tsx                         # Step 1: Upload files
├── review/page.tsx                  # Step 2: Review & edit AI-extracted data
├── result/page.tsx                  # Step 3: Download .docx
├── api/
│   ├── upload/route.ts              # Save files to /tmp
│   ├── extract/route.ts             # Claude Vision: image → structured data
│   ├── generate-narrative/route.ts  # Claude Text: transcript → narrative
│   └── generate-docx/route.ts       # docx-js: compile everything → downloadable .docx
components/
├── upload/FileDropzone.tsx, UploadForm.tsx
├── review/MetadataEditor.tsx, NarrativeEditor.tsx
├── shared/StepIndicator.tsx
lib/
├── claude.ts          # Claude API wrapper (Vision + Text)
├── docx-builder.ts    # docx-js document builder
├── file-naming.ts     # File naming utility
├── prompts.ts         # AI prompt templates
store/
└── useReportStore.ts  # Zustand: shared state across steps
types/
└── report.ts          # All TypeScript interfaces
public/assets/
└── logo-esdm.png      # STATIC — logo Kementerian ESDM (new logo), never changes. Already in repo.
```

## Core Data Types

```typescript
interface ExtractedData {
  perihal: string;
  tempat: string;
  hariTanggal: string;
  waktu: string;
  nomorSuratUndangan: string;
  tanggalSuratUndangan: string;
  pengirim: string;
  agenda: string;
}

interface GeneratedNarrative {
  dasarPenugasan: string;
  partisipanKegiatan: string[];
  hasilPembahasan: string;
}

interface ReportData {
  extracted: ExtractedData;
  narrative: GeneratedNarrative;
  nomorSuratTugas: string;
  tanggalSuratTugas: string;
  namaPelaksana: string;
  jabatanPelaksana: string;
  unitKerja: string;
  files: {
    undangan: string;
    fotoKegiatan: string[];
    daftarHadir: string[];
    materiPresentasi: string[];
  };
  transcript: string;
}
```

## File Naming

Format: `YYYYMMDD_Laporan SPD [Perihal Kegiatan].docx`
Example: `20260402_Laporan SPD Pelaksanaan PMPZI Kementerian ESDM TA 2025.docx`

## Document Template (CRITICAL — match exactly)

Reference file: `docs/sample.docx`. See `docs/template-reference.md` for annotated breakdown.

### Page setup
- **US Letter**: 12240 x 15840 DXA (NOT A4)
- **Margins**: 1440 DXA (1 inch) all sides
- **Content width**: 9360 DXA

### Structure overview

**Page 1-2 — Laporan Utama:**

1. Header area: Logo ESDM anchored left (903402 x 876300 EMU), title in bordered text box right ("LAPORAN PELAKSANAAN PERJALANAN DINAS", Arial 14pt bold)
2. Metadata table: 9615 DXA wide, 2 cols (3435 + 6180), 4 rows, thin border. Labels: Perihal/Agenda Kegiatan, Tempat Kegiatan, Hari dan Tanggal Kegiatan, Nomor dan Tanggal Surat Tugas
3. Content table: single-cell table (9600 DXA, thin border) containing ALL of sections A/B/C:
   - "Pelaksanaan Kegiatan" centered bold title
   - A. Dasar Penugasan (upperLetter numbering, bold title + justified paragraph)
   - B. Partisipan Kegiatan: (upperLetter continued, bold title + decimal sub-list)
   - C. Hasil Pembahasan (upperLetter continued, bold title + narrative paragraphs + presentation slide images)
4. Signature: right-aligned "Jakarta Selatan [tanggal]" + "Pelaksana Perjalanan Dinas" (inside content table)

**Page 3 — DOKUMENTASI KEGIATAN:** Title centered bold, photos in bordered table rows (8760 DXA, border sz=8)

**Page 4 — DAFTAR HADIR:** Title centered bold, attendance photos as inline images

**Page 5 — UNDANGAN:** Title centered bold, invitation image inline

### Key formatting
- Font: Times New Roman 12pt (sz=24), justified (jc=both)
- Line spacing: 276 (1.15x) for paragraphs, 240 for table cells
- Numbering: upperLetter (A. B. C.) for sections, decimal (1. 2.) for participants
- Page breaks between DOKUMENTASI, DAFTAR HADIR, UNDANGAN sections

## docx-js Rules

- US Letter page size (12240 x 15840 DXA)
- Tables: `WidthType.DXA` only, set both `columnWidths` and cell `width`
- Images: `ImageRun` requires `type` param. Scale proportionally within content width
- Never use `\n` — separate `Paragraph` elements
- `LevelFormat.UPPER_LETTER` for A/B/C sections, `LevelFormat.DECIMAL` for sub-lists

## Claude API

Model: `claude-sonnet-4-20250514`

**Vision** (`/api/extract`): image → JSON with perihal, tempat, hari_tanggal, waktu, nomor_surat, tanggal_surat, pengirim, agenda. System: "Respond ONLY with valid JSON."

**Text** (`/api/generate-narrative`): extracted data + transcript → dasar_penugasan, partisipan_kegiatan[], hasil_pembahasan. Formal Indonesian government style.

## UI Flow

3-step wizard. Step 1: Upload + manual fields → Step 2: Review & edit AI output → Step 3: Download .docx

## Style

- Tailwind CSS only, no custom CSS files
- Named exports (except page.tsx)
- Color: neutral/slate + ESDM gold (#C5A200) accent
- Desktop-first, mobile responsive

## Auth (Phase 2 — disabled by default)

SSO with gratifikasi-app via shared JWT. `AUTH_ENABLED=false` for development. Middleware validates Bearer token on `/api/*` routes when enabled.

## Future (Phase 3)

Google Drive auto-upload + WhatsApp agent (Visa) integration planned. Keep architecture modular for `lib/google-drive.ts` addition later.

## Important

- Error handling on all AI calls with user-friendly messages
- Client-side image resize (max 1024px) before upload
- Temp files in `/tmp/report-generator/[sessionId]/`, cleaned after generation
- Env vars: `ANTHROPIC_API_KEY` (required), `NEXT_PUBLIC_APP_URL`, `AUTH_ENABLED`, `JWT_SECRET`
- NEVER commit .env files
