# Task Breakdown — Report Generator

Copy-paste these prompts to Claude Code one at a time, in order.
Wait for each task to complete before moving to the next.

---

## Phase 1: Project Setup

### Task 1.1 — Init project
```
Initialize a new Next.js 14 project with App Router, TypeScript strict mode, and Tailwind CSS. Install these exact packages:

npm install docx @anthropic-ai/sdk zustand formidable
npm install -D @types/formidable

Create the folder structure from CLAUDE.md. Create empty placeholder files for all components, lib, store, and types. Create .env.local with ANTHROPIC_API_KEY placeholder and AUTH_ENABLED=false. Create .gitignore that excludes node_modules, .env*, .next, /tmp. The logo file is already at public/assets/logo-esdm.png.
```

### Task 1.2 — Types & store
```
Implement types/report.ts with all interfaces from CLAUDE.md (ExtractedData, GeneratedNarrative, ReportData). Then implement store/useReportStore.ts with Zustand — it should hold the full ReportData state plus actions: setExtracted, setNarrative, setFiles, setMetadata, setTranscript, resetAll. Include a computed isStep1Complete and isStep2Complete getter.
```

---

## Phase 2: Upload UI (Step 1)

### Task 2.1 — FileDropzone component
```
Build components/upload/FileDropzone.tsx — a reusable drag-and-drop file upload component. Props: accept (mime types), maxFiles, label, description, onFilesChange callback. Show thumbnail previews for images. Allow removing individual files. Client-side resize images to max 1024px longest edge before storing using canvas. Use Tailwind, make it look clean with a dashed border drop area.
```

### Task 2.2 — Upload page
```
Build app/page.tsx as Step 1 of the wizard. Include StepIndicator showing 3 steps (Upload → Review → Download). Layout with sections:
1. "Surat Undangan" — FileDropzone (1 image, required)
2. "Foto Kegiatan" — FileDropzone (max 5 images, required)
3. "Daftar Hadir" — FileDropzone (max 2 images, required)
4. "Materi Presentasi" — FileDropzone (max 10 images, optional)
5. "Transcript/Catatan" — textarea input (required)
6. Manual fields: Nomor Surat Tugas, Tanggal Surat Tugas, Nama Pelaksana, Jabatan, Unit Kerja
7. "Proses Laporan" button — stores everything in Zustand and navigates to /review

All data goes into the Zustand store, no API call yet.
```

---

## Phase 3: AI Processing (Backend)

### Task 3.1 — Claude API wrapper
```
Implement lib/claude.ts with two functions:

1. extractFromInvitation(imageBase64: string, mimeType: string): Promise<ExtractedData>
   — Uses Claude Vision to read the invitation image and return structured data
   — Model: claude-sonnet-4-20250514
   — System prompt: extract perihal, tempat, etc. Respond ONLY valid JSON.

2. generateNarrative(extracted: ExtractedData, transcript: string): Promise<GeneratedNarrative>
   — Uses Claude Text to generate formal Indonesian government report narrative
   — Returns dasarPenugasan, partisipanKegiatan array, hasilPembahasan

Both must have proper error handling and return typed results.
Also implement lib/prompts.ts with the prompt templates as separate exported constants.
```

### Task 3.2 — API routes
```
Implement these Next.js API routes:

1. app/api/extract/route.ts
   POST — receives base64 image + mimeType in JSON body
   Calls extractFromInvitation, returns ExtractedData JSON

2. app/api/generate-narrative/route.ts
   POST — receives ExtractedData + transcript in JSON body
   Calls generateNarrative, returns GeneratedNarrative JSON

Both should handle errors gracefully and return appropriate status codes.
```

---

## Phase 4: Review UI (Step 2)

### Task 4.1 — Review page
```
Build app/review/page.tsx as Step 2. On mount, if Zustand store has undangan image, call /api/extract to get structured data, then call /api/generate-narrative with the result + transcript. Show loading state during API calls.

Layout:
- Left column: MetadataEditor — editable form fields for all ExtractedData fields + manual metadata (nomor ST, etc)
- Right column: NarrativeEditor — editable textareas for dasarPenugasan, partisipanKegiatan (as comma-separated or list), hasilPembahasan. Each section has a "Regenerate" button.
- Below: collapsible section showing original transcript for reference
- Bottom: "Generate Laporan" button → navigates to /result

If store is empty (user navigated directly), redirect to /.
```

---

## Phase 5: Document Generation

### Task 5.1 — File naming utility
```
Implement lib/file-naming.ts with a function generateFileName(hariTanggal: string, perihal: string): string

It should:
- Parse Indonesian date string (e.g. "Rabu, 01 April 2026") into a Date object
- Format as YYYYMMDD
- Return: "${yyyymmdd}_Laporan SPD ${perihal}"
- Example: "20260402_Laporan SPD Pelaksanaan PMPZI Kementerian ESDM TA 2025"
- Handle edge cases: missing date (fallback to today)
```

### Task 5.2 — docx builder
```
Implement lib/docx-builder.ts — the core document builder using the docx npm package. This is the most critical file. Read docs/template-reference.md FIRST for exact specifications.

Export: buildReport(data: ReportData, imageBuffers: { undangan: Buffer, fotoKegiatan: Buffer[], daftarHadir: Buffer[], materiPresentasi: Buffer[], logo: Buffer }): Promise<Buffer>

Key specs from the actual template:
- Page: US Letter (12240 x 15840 DXA), margins 1440 all sides
- Header: logo as anchored image left, title "LAPORAN PELAKSANAAN PERJALANAN DINAS" in a bordered text box shape right (Arial 14pt bold)
- Metadata table: 9615 DXA wide, indent -318, 2 cols (3435 + 6180), 4 rows, thin border
- Content table: 9600 DXA wide single-cell table containing ALL sections A/B/C and signature
- Numbering: upperLetter for A/B/C sections (one continuous list), decimal for participant sub-list
- Section A: "Dasar Penugasan" paragraph referencing invitation letter
- Section B: "Partisipan Kegiatan:" with numbered sub-list
- Section C: "Hasil Pembahasan" with narrative paragraphs + presentation slide images
- Signature: right-aligned "Jakarta Selatan [tanggal]" + "Pelaksana Perjalanan Dinas" inside the content table
- Page 3: "DOKUMENTASI KEGIATAN" + photos in bordered table (8760 DXA, border sz=8)
- Page 4: "DAFTAR HADIR" + attendance photos as inline images
- Page 5: "UNDANGAN" + invitation image inline

Font: Times New Roman 12pt everywhere except title box (Arial 14pt bold).
Use the logo from public/assets/logo-esdm.png.
```
// DI SINI
### Task 5.3 — Generate docx API route
```
Implement app/api/generate-docx/route.ts
POST — receives full ReportData with base64 images in body.
1. Convert base64 images to Buffers
2. Read logo from public/assets/logo-esdm.png
3. Call buildReport to generate .docx buffer
4. Generate filename using generateFileName(extracted.hariTanggal, extracted.perihal)
5. Return the .docx file as a downloadable blob response with Content-Type application/vnd.openxmlformats-officedocument.wordprocessingml.document and Content-Disposition with the generated filename
```

### Task 5.4 — Result page
```
Build app/result/page.tsx as Step 3. On mount, call /api/generate-docx with all data from Zustand store. Show loading state with progress message "Membuat dokumen...". On success:
- Show download button that triggers file download with the correct filename
- Show the filename for reference
- Show "Buat Laporan Baru" button that resets store and navigates to /
On error: show error message with retry button.
```

---

## Phase 6: Polish

### Task 6.1 — Error handling & loading states
```
Review all pages and API routes. Add:
- Loading spinners/skeleton during API calls
- Error toasts or inline error messages when API fails
- Retry button on failed API calls
- Form validation on Step 1 (required fields)
- Redirect guards (can't access /review without Step 1 data, can't access /result without Step 2 data)
```

### Task 6.2 — Mobile responsive
```
Review all pages on mobile viewport (375px). Fix any layout issues. The upload page should stack vertically on mobile. The review page should show metadata editor above narrative editor on mobile instead of side-by-side.
```
