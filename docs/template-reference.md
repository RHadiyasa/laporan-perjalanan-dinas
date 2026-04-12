# Template Reference — Laporan Pelaksanaan Perjalanan Dinas

Based on XML analysis of actual sample document (`docs/sample.docx`).

## Page Setup

- Paper: **US Letter** (12240 x 15840 DXA) — NOT A4
- Margins: 1440 DXA all sides (1 inch)
- Content width: 9360 DXA
- Footer reference present (page numbers)

## Page 1-2: Laporan Utama

Everything on pages 1-2 is in a continuous flow (no section breaks).

### 1. Header Area

The header uses **anchored elements** (not the docx header/footer system):

**Logo (anchored image):**
- Position: column-relative, offset x = -180947 EMU (slightly left of margin)
- Position: paragraph-relative, offset y = 0
- Size: 903402 x 876300 EMU (~2.5 x 2.4 cm)
- Wrap: none
- File: `logo-esdm.png` (new logo from `public/assets/`)

**Title box (WordprocessingShape):**
- Position: column-relative, offset x = 790575 EMU
- Size: 5124133 x 876300 EMU
- Shape: rectangle with solid border (dk1 color, 22225 width)
- No fill
- Text: "LAPORAN PELAKSANAAN PERJALANAN DINAS"
- Font: Arial 14pt bold, centered, vertically centered

### 2. Metadata Table (Table 1)

```
Width: 9615 DXA
Indent: -318 DXA (negative, extends slightly past left margin)
Columns: 3435 + 6180 DXA
Border: single, sz=4, black
Layout: fixed
```

| Row | Left Cell (3435 DXA) | Right Cell (6180 DXA) |
|-----|---------------------|----------------------|
| 1 | Perihal/Agenda Kegiatan | [dari undangan] |
| 2 | Tempat Kegiatan | [alamat lengkap] |
| 3 | Hari dan Tanggal Kegiatan | [hari, DD bulan YYYY] |
| 4 | Nomor dan Tanggal Surat Tugas | [nomor ST, tanggal ST] |

Font: Times New Roman 12pt, justified (jc=both), line spacing 240.

### 3. Content Table (Table 2 — single-cell container)

This is a key structural element: ALL content sections (A, B, C + signature) are inside **one table cell**.

```
Width: 9600 DXA
Indent: -318 DXA
Single column: 9600 DXA
Border: single, sz=4, black
Layout: fixed
```

**Inside the cell:**

**Title:** "Pelaksanaan Kegiatan" — bold, centered, Times New Roman 12pt, line spacing 276

**Section A — Dasar Penugasan:**
- Uses numbering: abstractNumId=1, upperLetter format ("A.")
- Title run is bold
- Indent: left 342, hanging 360
- Content paragraph below: left 350 indent, justified, line spacing 276
- Text pattern: "Dalam rangka menghadiri Surat Undangan [Pengirim] Nomor [nomor] tanggal [tanggal] Perihal [perihal]"

**Section B — Partisipan Kegiatan:**
- Continues same numbering (numId=1) → auto-becomes "B."
- Title run is bold
- Sub-list uses numId=2, decimal format ("1.", "2.")
- Sub-list indent: left 780, hanging 360
- Items: "Perwakilan [unit kerja]"

**Section C — Hasil Pembahasan:**
- Continues same numbering (numId=1) → auto-becomes "C."
- Title run is bold
- Content: presentation slide images (inline, centered) + narrative paragraphs
- Images centered in paragraphs with indent left 720

**Signature block (still inside the table cell):**
- Empty paragraph as spacer
- "Jakarta Selatan [DD bulan YYYY]" — right-aligned (jc=right), Times New Roman 12pt
- "Pelaksana Perjalanan Dinas" — right-aligned, indent left 5760

### 4. Page Break

After the content table closes, a `w:br w:type="page"` creates the page break.

## Page 3: DOKUMENTASI KEGIATAN

- Title: "DOKUMENTASI KEGIATAN" — bold, centered, Times New Roman 12pt

- Photos wrapped in a bordered table (Table3 style):
  - Width: 8760 DXA, centered (jc=center)
  - Border: single, sz=8 (thicker than metadata table)
  - Each photo in its own row, in its own cell
  - Cell margins: 100 DXA all sides
  - Images: inline, centered

## Page 4: DAFTAR HADIR

- Page break before
- Title: "DAFTAR HADIR" — bold, centered, Times New Roman 12pt
- Attendance photos: inline images (NOT in a table), centered
- Multiple photos stacked vertically

## Page 5: UNDANGAN

- Title: "UNDANGAN" — bold, centered, Times New Roman 12pt
- Invitation image: inline, centered
- Full page width image

## Numbering Definitions

Two numbering definitions are needed:

**numId=1 (Sections A/B/C):**
- Level 0: upperLetter, "%1.", left-aligned
- indent: left 720, hanging 360

**numId=2 (Participant sub-list):**
- Level 0: decimal, "%1.", left-aligned
- indent: left 1080, hanging 360

## Font Summary

| Element | Font | Size | Style |
|---------|------|------|-------|
| Title box | Arial | 14pt (sz=28) | Bold |
| All body text | Times New Roman | 12pt (sz=24) | Normal |
| Section titles (A/B/C) | Times New Roman | 12pt (sz=24) | Bold |
| "Pelaksanaan Kegiatan" | Times New Roman | 12pt (sz=24) | Bold |
| Page titles (DOKUMENTASI, etc) | Times New Roman | 12pt (sz=24) | Bold |
