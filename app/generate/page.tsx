"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { useReportStore } from "@/store/useReportStore";

const STEPS = [{ label: "Upload" }, { label: "Review" }, { label: "Unduh" }];
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp";
const ACCEPT_IMAGE_PDF = "image/jpeg,image/png,image/webp,application/pdf";

export default function GeneratePage() {
  const router = useRouter();
  const { setFiles, setMetadata, setTranscript } = useReportStore();

  const [undangan, setUndangan] = useState<File[]>([]);
  const [fotoKegiatan, setFotoKegiatan] = useState<File[]>([]);
  const [daftarHadir, setDaftarHadir] = useState<File[]>([]);
  const [materiPresentasi, setMateriPresentasi] = useState<File[]>([]);
  const [transcript, setTranscriptLocal] = useState("");
  const [nomorSuratTugas, setNomorSuratTugas] = useState("");
  const [tanggalSuratTugas, setTanggalSuratTugas] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [navigating, setNavigating] = useState(false);

  function isFormComplete() {
    return (
      undangan.length > 0 &&
      fotoKegiatan.length > 0 &&
      daftarHadir.length > 0 &&
      nomorSuratTugas.trim() !== "" &&
      tanggalSuratTugas.trim() !== "" &&
      unitKerja.trim() !== ""
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isFormComplete()) return;
    setNavigating(true);

    const toUrls = (files: File[]) => files.map((f) => URL.createObjectURL(f));
    setFiles({
      undangan: toUrls(undangan)[0] ?? "",
      fotoKegiatan: toUrls(fotoKegiatan),
      daftarHadir: toUrls(daftarHadir),
      materiPresentasi: toUrls(materiPresentasi),
    });
    setMetadata({ nomorSuratTugas, tanggalSuratTugas, unitKerja });
    setTranscript(transcript);
    router.push("/review");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm shadow-teal-200">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Generator Laporan SPD</p>
              <p className="text-xs text-slate-400">Kementerian ESDM</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <StepIndicator steps={STEPS} current={0} />

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Surat Undangan */}
          <Card title="Surat Undangan" badge="Wajib" badgeColor="red">
            <FileDropzone
              accept={ACCEPT_IMAGE_PDF}
              maxFiles={1}
              label="Upload surat undangan"
              description="Format JPG / PNG / WEBP / PDF (halaman pertama)"
              onFilesChange={setUndangan}
            />
            {submitted && undangan.length === 0 && <FieldError>Surat undangan wajib diupload.</FieldError>}
          </Card>

          {/* Foto Kegiatan */}
          <Card title="Foto Kegiatan" badge="Wajib" badgeColor="red">
            <FileDropzone
              accept={ACCEPT_IMAGE}
              maxFiles={5}
              label="Upload foto kegiatan"
              description="Maks. 5 foto · JPG / PNG / WEBP"
              onFilesChange={setFotoKegiatan}
            />
            {submitted && fotoKegiatan.length === 0 && <FieldError>Minimal 1 foto kegiatan wajib diupload.</FieldError>}
          </Card>

          {/* Daftar Hadir */}
          <Card title="Daftar Hadir" badge="Wajib" badgeColor="red">
            <FileDropzone
              accept={ACCEPT_IMAGE}
              maxFiles={2}
              label="Upload daftar hadir"
              description="Maks. 2 halaman · JPG / PNG / WEBP"
              onFilesChange={setDaftarHadir}
            />
            {submitted && daftarHadir.length === 0 && <FieldError>Daftar hadir wajib diupload.</FieldError>}
          </Card>

          {/* Materi Presentasi */}
          <Card title="Materi Presentasi" badge="Opsional" badgeColor="slate">
            <p className="text-xs text-slate-500">
              File ini akan dilampirkan sebagai bagian pendukung laporan pada bagian Hasil Pembahasan.
            </p>
            <FileDropzone
              accept={ACCEPT_IMAGE_PDF}
              maxFiles={10}
              label="Upload materi presentasi"
              description="Opsional · Maks. 10 halaman · JPG / PNG / WEBP / PDF"
              onFilesChange={setMateriPresentasi}
            />
          </Card>

          {/* Transcript */}
          <Card title="Transcript / Catatan Rapat" badge="Opsional" badgeColor="slate">
            <p className="text-xs text-slate-500 mb-3">
              Sangat dianjurkan. Transcript membantu Visa menghasilkan narasi Hasil Pembahasan
              yang lebih akurat dan detail.
            </p>
            <textarea
              rows={5}
              placeholder="Tempelkan transcript atau catatan hasil rapat di sini…"
              value={transcript}
              onChange={(e) => setTranscriptLocal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-y transition-colors"
            />
          </Card>

          {/* Data Surat Tugas */}
          <Card title="Data Surat Tugas" badge="Wajib" badgeColor="red">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nomor Surat Tugas" required error={submitted && nomorSuratTugas.trim() === ""}>
                <input
                  type="text"
                  placeholder="Contoh: 123/ST/2024"
                  value={nomorSuratTugas}
                  onChange={(e) => setNomorSuratTugas(e.target.value)}
                  className={inputCls(submitted && nomorSuratTugas.trim() === "")}
                />
              </FormField>
              <FormField label="Tanggal Surat Tugas" required error={submitted && tanggalSuratTugas.trim() === ""}>
                <input
                  type="date"
                  value={tanggalSuratTugas}
                  onChange={(e) => setTanggalSuratTugas(e.target.value)}
                  className={inputCls(submitted && tanggalSuratTugas.trim() === "")}
                />
              </FormField>
              <FormField label="Unit Kerja" required error={submitted && unitKerja.trim() === ""} className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nama unit kerja / direktorat"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  className={inputCls(submitted && unitKerja.trim() === "")}
                />
              </FormField>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={navigating}
              className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {navigating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Memproses…
                </>
              ) : (
                <>
                  Proses Laporan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Card({
  title, badge, badgeColor, children,
}: {
  title: string;
  badge?: string;
  badgeColor?: "red" | "slate";
  children: React.ReactNode;
}) {
  const badgeCls =
    badgeColor === "red"
      ? "bg-red-50 text-red-500 border border-red-100"
      : "bg-slate-100 text-slate-400 border border-slate-200";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {badge && (
          <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${badgeCls}`}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FormField({
  label, required, error, className, children,
}: {
  label: string; required?: boolean; error?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <FieldError>{label} wajib diisi.</FieldError>}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400",
    "focus:outline-none focus:ring-2 transition-colors",
    hasError
      ? "border-red-300 focus:ring-red-200"
      : "border-slate-200 focus:ring-teal-400/40 focus:border-teal-400",
  ].join(" ");
}
