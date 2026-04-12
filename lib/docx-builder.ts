import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { IBordersOptions } from "docx";
import type { ReportData } from "@/types/report";

// ── Page constants (A4) ───────────────────────────────────────────────────────
const DXA_PAGE_W    = 11906;
const DXA_PAGE_H    = 16838;
const DXA_MARGIN_T  = 1134;
const DXA_MARGIN_R  = 1134;
const DXA_MARGIN_B  = 1134;
const DXA_MARGIN_L  = 1418;
const DXA_CONTENT   = DXA_PAGE_W - DXA_MARGIN_L - DXA_MARGIN_R; // 9354 DXA

// At 96 DPI: px = DXA / 1440 * 96
const PX_CONTENT = Math.round((DXA_CONTENT / 1440) * 96); // ~624 px
const PX_PAGE_H  = Math.round(((DXA_PAGE_H - DXA_MARGIN_T - DXA_MARGIN_B) / 1440) * 96); // ~971 px

// Logo: 120 × 49 px (matches sample: 1143000 × 466725 EMU, aspect = SVG 493:200)
const LOGO_W_PX = 120;
const LOGO_H_PX = 49;

const TNR   = "Times New Roman";
const ARIAL = "Arial";

// ── Brand colours (from sample XML) ──────────────────────────────────────────
const C_DARK_BLUE    = "1B3A5C"; // header bg, section title colour
const C_LIGHT_BLUE   = "DAE9F7"; // metadata label bg
const C_BLUE_LINE    = "2E75B6"; // separator border below header
const C_GRAY_SEP     = "D0D0D0"; // metadata row separator
const C_STEEL_BLUE   = "B0C4DE"; // photo-table cell border
const C_COLON        = "555555"; // ":" in metadata table
const C_WHITE        = "FFFFFF";

// ── Image helpers ─────────────────────────────────────────────────────────────

const TRANSPARENT_PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

function detectImageType(buf: Buffer): "jpg" | "png" | "svg" {
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50) return "png";
  const head = buf.subarray(0, 32).toString("utf8").trimStart();
  if (head.startsWith("<")) return "svg";
  return "jpg";
}

function makeImageRun(buf: Buffer, w: number, h: number): ImageRun {
  const type = detectImageType(buf);
  if (type === "svg") {
    return new ImageRun({
      data: buf,
      transformation: { width: w, height: h },
      type: "svg",
      fallback: { type: "png", data: TRANSPARENT_PNG_1PX },
    });
  }
  return new ImageRun({ data: buf, transformation: { width: w, height: h }, type });
}

function getImageDimensions(buf: Buffer): { width: number; height: number } {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      if (marker === 0xd9) break;
      const segLen = buf.readUInt16BE(i + 2);
      i += 2 + segLen;
    }
  } catch { /* fall through */ }
  return { width: 800, height: 600 };
}

function scaleToWidth(buf: Buffer, maxPx: number): { width: number; height: number } {
  const { width, height } = getImageDimensions(buf);
  if (width <= maxPx) return { width, height };
  return { width: maxPx, height: Math.round((height / width) * maxPx) };
}

function scaleToFit(buf: Buffer, maxW: number, maxH: number): { width: number; height: number } {
  const { width, height } = getImageDimensions(buf);
  const scale = Math.min(
    width  > maxW ? maxW / width  : 1,
    height > maxH ? maxH / height : 1,
  );
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

// ── Shared border helpers ─────────────────────────────────────────────────────

function solidBorder(sz: number, color = "000000") {
  return { style: BorderStyle.SINGLE, size: sz, color };
}
function noBorder() {
  return { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
}
const CELL_NO_BORDER = { top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() };

// ── Text helpers ──────────────────────────────────────────────────────────────

function run(text: string, opts: {
  font?: string; size?: number; bold?: boolean; color?: string
} = {}): TextRun {
  return new TextRun({
    text,
    font:  opts.font  ?? TNR,
    size:  opts.size  ?? 24,
    bold:  opts.bold  ?? false,
    color: opts.color,
  });
}

// ── Paragraph helpers ─────────────────────────────────────────────────────────

/** Dark-blue background banner paragraph (PELAKSANAAN KEGIATAN / section page titles) */
function bannerParagraph(text: string, opts: {
  sizePt?: number; pageBreakBefore?: boolean; spacingAfter?: number;
} = {}): Paragraph {
  return new Paragraph({
    pageBreakBefore: opts.pageBreakBefore ?? false,
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.CLEAR, color: "auto", fill: C_DARK_BLUE },
    spacing: { before: 0, after: opts.spacingAfter ?? 160, line: 276 },
    children: [
      run(`   ${text}   `, {
        bold: true,
        color: C_WHITE,
        size: (opts.sizePt ?? 12) * 2,
      }),
    ],
  });
}

/** Standard TNR 12pt paragraph */
function bodyPara(children: (TextRun | ImageRun)[], opts: {
  indent?: { left?: number; hanging?: number };
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  spacing?: { before?: number; after?: number; line?: number };
  pageBreakBefore?: boolean;
  numbering?: { reference: string; level: number };
  shading?: { type: typeof ShadingType[keyof typeof ShadingType]; color: string; fill: string };
  border?: IBordersOptions;
} = {}): Paragraph {
  return new Paragraph({
    children,
    alignment: opts.alignment ?? AlignmentType.LEFT,
    spacing: { line: 276, before: 0, after: 0, ...opts.spacing },
    indent: opts.indent,
    pageBreakBefore: opts.pageBreakBefore,
    numbering: opts.numbering,
    shading: opts.shading,
    border: opts.border,
  });
}

function spacer(before = 0, after = 0): Paragraph {
  return new Paragraph({ children: [], spacing: { before, after, line: 276 } });
}

// ── Page 1: Header table (logo left | blue title right) ──────────────────────

function makeHeaderTable(logo: Buffer): Table {
  const LOGO_COL  = 2200;
  const TITLE_COL = DXA_CONTENT - LOGO_COL; // 7154

  return new Table({
    layout: TableLayoutType.FIXED,
    columnWidths: [LOGO_COL, TITLE_COL],
    width: { size: DXA_CONTENT, type: WidthType.DXA },
    borders: {
      top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder(),
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        children: [
          // ── Logo cell ──
          new TableCell({
            width: { size: LOGO_COL, type: WidthType.DXA },
            borders: CELL_NO_BORDER,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 40, bottom: 40, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [makeImageRun(logo, LOGO_W_PX, LOGO_H_PX)],
              }),
            ],
          }),

          // ── Title cell (dark blue bg) ──
          new TableCell({
            width: { size: TITLE_COL, type: WidthType.DXA },
            borders: CELL_NO_BORDER,
            verticalAlign: VerticalAlign.CENTER,
            shading: { type: ShadingType.CLEAR, color: "auto", fill: C_DARK_BLUE },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [run("LAPORAN PELAKSANAAN", { font: ARIAL, size: 28, bold: true, color: C_WHITE })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 0 },
                children: [run("PERJALANAN DINAS", { font: ARIAL, size: 28, bold: true, color: C_WHITE })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Blue bottom-border separator line below header */
function makeHeaderSeparator(): Paragraph {
  return new Paragraph({
    children: [],
    spacing: { before: 0, after: 0 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 12, color: C_BLUE_LINE, space: 1 },
    },
  });
}

// ── Page 1: Metadata table (3 cols: label | ":" | value) ─────────────────────

function makeMetadataTable(data: ReportData): Table {
  const C1 = 3200; // label
  const C2 = 400;  // ":"
  const C3 = 5754; // value
  const W  = DXA_CONTENT; // 9354

  function metaRow(label: string, value: string): TableRow {
    const rowBorder = {
      top: noBorder(),
      left: noBorder(),
      right: noBorder(),
      bottom: solidBorder(1, C_GRAY_SEP),
    };
    return new TableRow({
      children: [
        // Label cell
        new TableCell({
          width: { size: C1, type: WidthType.DXA },
          borders: rowBorder,
          shading: { type: ShadingType.CLEAR, color: "auto", fill: C_LIGHT_BLUE },
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          children: [
            bodyPara(
              [run(label, { bold: true, size: 20, color: C_DARK_BLUE })],
              { spacing: { before: 60, after: 60 } }
            ),
          ],
        }),
        // ":" cell
        new TableCell({
          width: { size: C2, type: WidthType.DXA },
          borders: rowBorder,
          shading: { type: ShadingType.CLEAR, color: "auto", fill: C_LIGHT_BLUE },
          margins: { top: 60, bottom: 60, left: 0, right: 0 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
              children: [run(":", { color: C_COLON })],
            }),
          ],
        }),
        // Value cell
        new TableCell({
          width: { size: C3, type: WidthType.DXA },
          borders: rowBorder,
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          children: [
            bodyPara(
              [run(value)],
              { spacing: { before: 60, after: 60, line: 276 }, alignment: AlignmentType.BOTH }
            ),
          ],
        }),
      ],
    });
  }

  return new Table({
    layout: TableLayoutType.FIXED,
    columnWidths: [C1, C2, C3],
    width: { size: W, type: WidthType.DXA },
    borders: {
      top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder(),
      insideHorizontal: noBorder(), insideVertical: noBorder(),
    },
    rows: [
      metaRow("Perihal / Agenda Kegiatan",     data.extracted.perihal),
      metaRow("Tempat Kegiatan",                data.extracted.tempat),
      metaRow("Hari dan Tanggal Kegiatan",      data.extracted.hariTanggal),
      metaRow(
        "Nomor dan Tanggal Surat Tugas",
        `${data.nomorSuratTugas}, ${data.tanggalSuratTugas}`
      ),
    ],
  });
}

// ── Page 1-2: Main content (Sections A / B / C + signature) ──────────────────

function makeMainContent(data: ReportData, slideBuffers: Buffer[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];

  // ── PELAKSANAAN KEGIATAN banner ──
  items.push(bannerParagraph("PELAKSANAAN KEGIATAN", { spacingAfter: 160 }));

  // ── Section A: Dasar Penugasan ──
  items.push(
    bodyPara([run("Dasar Penugasan", { bold: true, color: C_DARK_BLUE })], {
      numbering: { reference: "section-list", level: 0 },
      spacing: { before: 200, after: 100, line: 276 },
    })
  );

  const dasarParagraphs = data.narrative.dasarPenugasan
    .split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  for (const text of dasarParagraphs) {
    items.push(
      bodyPara([run(text)], {
        alignment: AlignmentType.BOTH,
        indent: { left: 567 },
        spacing: { before: 0, after: 160, line: 320 },
      })
    );
  }

  // ── Section B: Partisipan Kegiatan ──
  items.push(
    bodyPara([run("Partisipan Kegiatan", { bold: true, color: C_DARK_BLUE })], {
      numbering: { reference: "section-list", level: 0 },
      spacing: { before: 200, after: 100, line: 276 },
    })
  );

  for (const participant of data.narrative.partisipanKegiatan) {
    items.push(
      bodyPara([run(participant)], {
        numbering: { reference: "participant-list", level: 0 },
        spacing: { before: 40, after: 40, line: 300 },
      })
    );
  }

  // ── Section C: Hasil Pembahasan ──
  items.push(
    bodyPara([run("Hasil Pembahasan", { bold: true, color: C_DARK_BLUE })], {
      numbering: { reference: "section-list", level: 0 },
      spacing: { before: 200, after: 100, line: 276 },
    })
  );

  const narrativeParagraphs = data.narrative.hasilPembahasan
    .split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  for (const text of narrativeParagraphs) {
    items.push(
      bodyPara([run(text)], {
        alignment: AlignmentType.BOTH,
        indent: { left: 567 },
        spacing: { before: 0, after: 120, line: 320 },
      })
    );
  }

  // Presentation slides (inline, centered, after narrative)
  if (slideBuffers.length > 0) {
    items.push(spacer(200, 0));
    for (const buf of slideBuffers) {
      const dims = scaleToWidth(buf, PX_CONTENT);
      items.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200, line: 276 },
          children: [makeImageRun(buf, dims.width, dims.height)],
        })
      );
    }
  }

  // ── Signature ──
  const sigDate = data.extracted.hariTanggal
    .replace(/^[^,]+,\s*/, "").trim() || data.tanggalSuratTugas;

  const tempatTandaTangan = data.tempatPelaksanaan || data.extracted.tempat || "Jakarta Selatan";

  items.push(spacer(200, 0));
  items.push(
    bodyPara([run(`${tempatTandaTangan}, ${sigDate}`)], {
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 40, line: 276 },
    })
  );
  items.push(
    bodyPara([run("Pelaksana Perjalanan Dinas")], {
      alignment: AlignmentType.RIGHT,
      spacing: { before: 0, after: 0, line: 276 },
    })
  );
  // Signature gap
  for (let i = 0; i < 4; i++) items.push(spacer());

  return items;
}

// ── Page 3: DOKUMENTASI KEGIATAN ─────────────────────────────────────────────

function makeDocsPage(photoBuffers: Buffer[]): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = [];
  items.push(bannerParagraph("DOKUMENTASI KEGIATAN", { pageBreakBefore: true, spacingAfter: 240, sizePt: 13 }));

  if (photoBuffers.length === 0) return items;

  // Each photo in its own table row, light steel-blue border
  const cellBorder = solidBorder(1, C_STEEL_BLUE);
  const photoRows = photoBuffers.map((buf) => {
    const dims = scaleToFit(buf, PX_CONTENT, PX_PAGE_H);
    return new TableRow({
      children: [
        new TableCell({
          width: { size: DXA_CONTENT, type: WidthType.DXA },
          borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0, line: 276 },
              children: [makeImageRun(buf, dims.width, dims.height)],
            }),
          ],
        }),
      ],
    });
  });

  items.push(
    new Table({
      layout: TableLayoutType.FIXED,
      columnWidths: [DXA_CONTENT],
      width: { size: DXA_CONTENT, type: WidthType.DXA },
      borders: {
        top: solidBorder(4), bottom: solidBorder(4),
        left: solidBorder(4), right: solidBorder(4),
        insideHorizontal: solidBorder(4), insideVertical: noBorder(),
      },
      rows: photoRows,
    })
  );

  return items;
}

// ── Page 4: DAFTAR HADIR ─────────────────────────────────────────────────────

function makeDaftarHadirPage(photoBuffers: Buffer[]): Paragraph[] {
  const items: Paragraph[] = [
    bannerParagraph("DAFTAR HADIR", { pageBreakBefore: true, spacingAfter: 240, sizePt: 13 }),
  ];

  for (const buf of photoBuffers) {
    const dims = scaleToFit(buf, PX_CONTENT, PX_PAGE_H);
    items.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 0, line: 276 },
        children: [makeImageRun(buf, dims.width, dims.height)],
      })
    );
  }

  return items;
}

// ── Page 5: UNDANGAN ─────────────────────────────────────────────────────────

function makeUndanganPage(undanganBuf: Buffer): Paragraph[] {
  const dims = scaleToWidth(undanganBuf, PX_CONTENT);
  return [
    bannerParagraph("UNDANGAN", { pageBreakBefore: true, spacingAfter: 240, sizePt: 13 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 0, line: 276 },
      children: [makeImageRun(undanganBuf, dims.width, dims.height)],
    }),
  ];
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface ImageBuffers {
  logo: Buffer;
  undangan: Buffer;
  fotoKegiatan: Buffer[];
  daftarHadir: Buffer[];
  materiPresentasi: Buffer[];
}

export async function buildReport(data: ReportData, imageBuffers: ImageBuffers): Promise<Buffer> {
  const numbering = {
    config: [
      {
        reference: "section-list",
        levels: [{
          level: 0,
          format: LevelFormat.UPPER_LETTER,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "participant-list",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } },
        }],
      },
    ],
  };

  const pageSetup = {
    size: { width: DXA_PAGE_W, height: DXA_PAGE_H },
    margin: {
      top: DXA_MARGIN_T, right: DXA_MARGIN_R,
      bottom: DXA_MARGIN_B, left: DXA_MARGIN_L,
    },
  };

  const doc = new Document({
    numbering,
    sections: [{
      properties: { page: pageSetup },
      children: [
        // ── Pages 1-2: Laporan Utama ──
        makeHeaderTable(imageBuffers.logo),
        makeHeaderSeparator(),
        spacer(200, 0),
        makeMetadataTable(data),
        spacer(300, 0),
        ...makeMainContent(data, imageBuffers.materiPresentasi),

        // ── Page 3: DOKUMENTASI KEGIATAN ──
        ...makeDocsPage(imageBuffers.fotoKegiatan),

        // ── Page 4: DAFTAR HADIR ──
        ...makeDaftarHadirPage(imageBuffers.daftarHadir),

        // ── Page 5: UNDANGAN ──
        ...makeUndanganPage(imageBuffers.undangan),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}
