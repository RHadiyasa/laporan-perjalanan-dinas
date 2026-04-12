"use client";

import type { ExtractedData } from "@/types/report";

interface MetadataEditorProps {
  extracted: ExtractedData;
  nomorSuratTugas: string;
  tanggalSuratTugas: string;
  unitKerja: string;
  tempatPelaksanaan: string;
  onExtractedChange: (data: ExtractedData) => void;
  onMetaChange: (meta: {
    nomorSuratTugas?: string;
    tanggalSuratTugas?: string;
    unitKerja?: string;
    tempatPelaksanaan?: string;
  }) => void;
}

export function MetadataEditor({
  extracted,
  nomorSuratTugas,
  tanggalSuratTugas,
  unitKerja,
  tempatPelaksanaan,
  onExtractedChange,
  onMetaChange,
}: MetadataEditorProps) {
  function updateExtracted(key: keyof ExtractedData, value: string) {
    onExtractedChange({ ...extracted, [key]: value });
  }

  return (
    <div className="space-y-6">
      {/* ── Dari surat undangan ── */}
      <Fieldset legend="Data dari Surat Undangan">
        <Field label="Perihal">
          <input
            type="text"
            value={extracted.perihal}
            onChange={(e) => updateExtracted("perihal", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Pengirim">
          <input
            type="text"
            value={extracted.pengirim}
            onChange={(e) => updateExtracted("pengirim", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Nomor Surat Undangan">
          <input
            type="text"
            value={extracted.nomorSuratUndangan}
            onChange={(e) => updateExtracted("nomorSuratUndangan", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tanggal Surat Undangan">
          <input
            type="text"
            value={extracted.tanggalSuratUndangan}
            onChange={(e) => updateExtracted("tanggalSuratUndangan", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tempat Kegiatan">
          <input
            type="text"
            value={extracted.tempat}
            onChange={(e) => updateExtracted("tempat", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Hari dan Tanggal Kegiatan">
          <input
            type="text"
            value={extracted.hariTanggal}
            onChange={(e) => updateExtracted("hariTanggal", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Waktu">
          <input
            type="text"
            value={extracted.waktu}
            onChange={(e) => updateExtracted("waktu", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Agenda">
          <textarea
            rows={3}
            value={extracted.agenda}
            onChange={(e) => updateExtracted("agenda", e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </Field>
      </Fieldset>

      {/* ── Data surat tugas ── */}
      <Fieldset legend="Data Surat Tugas">
        <Field label="Nomor Surat Tugas">
          <input
            type="text"
            value={nomorSuratTugas}
            onChange={(e) => onMetaChange({ nomorSuratTugas: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Tanggal Surat Tugas">
          <input
            type="text"
            value={tanggalSuratTugas}
            onChange={(e) => onMetaChange({ tanggalSuratTugas: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Unit Kerja">
          <input
            type="text"
            value={unitKerja}
            onChange={(e) => onMetaChange({ unitKerja: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field
          label="Tempat Pelaksanaan Kegiatan"
          hint="Digunakan pada baris tanda tangan. Terisi otomatis dari surat undangan."
        >
          <input
            type="text"
            value={tempatPelaksanaan}
            onChange={(e) => onMetaChange({ tempatPelaksanaan: e.target.value })}
            className={inputClass}
            placeholder="Contoh: Jakarta Selatan"
          />
        </Field>
      </Fieldset>
    </div>
  );
}

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 " +
  "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-esdm-gold/30 transition-colors";
