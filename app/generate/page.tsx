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
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Generator Laporan Perjalanan Dinas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Kementerian ESDM</p>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <StepIndicator steps={STEPS} current={0} />

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Surat Undangan */}
          <Section title="Surat Undangan" required>
            <FileDropzone
              accept={ACCEPT_IMAGE_PDF}
              maxFiles={1}
              label="Upload surat undangan"
              description="Format JPG / PNG / WEBP / PDF (halaman pertama)"
              onFilesChange={setUndangan}
            />
            {submitted && undangan.length === 0 && (
              <FieldError>Surat undangan wajib diupload.</FieldError>
            )}
          </Section>

          {/* Foto Kegiatan */}
          <Section title="Foto Kegiatan" required>
            <FileDropzone
              accept={ACCEPT_IMAGE}
              maxFiles={5}
              label="Upload foto kegiatan"
              description="Maks. 5 foto · JPG / PNG / WEBP"
              onFilesChange={setFotoKegiatan}
            />
            {submitted && fotoKegiatan.length === 0 && (
              <FieldError>Minimal 1 foto kegiatan wajib diupload.</FieldError>
            )}
          </Section>

          {/* Daftar Hadir */}
          <Section title="Daftar Hadir" required>
            <FileDropzone
              accept={ACCEPT_IMAGE}
              maxFiles={2}
              label="Upload daftar hadir"
              description="Maks. 2 halaman · JPG / PNG / WEBP"
              onFilesChange={setDaftarHadir}
            />
            {submitted && daftarHadir.length === 0 && (
              <FieldError>Daftar hadir wajib diupload.</FieldError>
            )}
          </Section>

          {/* Materi Presentasi */}
          <Section title="Materi Presentasi" optional>
            <p className="text-xs text-slate-500 mt-1">
              File ini akan dilampirkan sebagai bagian pendukung laporan pada
              bagian Hasil Pembahasan.
            </p>
            <FileDropzone
              accept={ACCEPT_IMAGE_PDF}
              maxFiles={10}
              label="Upload materi presentasi"
              description="Opsional · Maks. 10 halaman · JPG / PNG / WEBP / PDF"
              onFilesChange={setMateriPresentasi}
            />
          </Section>

          {/* Transcript */}
          <Section title="Transcript / Catatan Rapat" optional>
            <p className="text-xs text-slate-500 -mt-1 mb-3">
              Opsional, namun sangat dianjurkan. Transcript atau catatan rapat
              membantu AI menghasilkan narasi Hasil Pembahasan yang lebih akurat
              dan detail.
            </p>
            <textarea
              rows={6}
              placeholder="Tempelkan transcript atau catatan hasil rapat di sini… (bisa berupa notulen singkat, poin-poin hasil rapat, atau transcript rekaman)"
              value={transcript}
              onChange={(e) => setTranscriptLocal(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-esdm-gold/30 resize-y transition-colors"
            />
          </Section>

          {/* Data Surat Tugas */}
          <Section title="Data Surat Tugas" required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nomor Surat Tugas"
                required
                error={submitted && nomorSuratTugas.trim() === ""}
              >
                <input
                  type="text"
                  placeholder="Contoh: 123/ST/2024"
                  value={nomorSuratTugas}
                  onChange={(e) => setNomorSuratTugas(e.target.value)}
                  className={inputClass(submitted && nomorSuratTugas.trim() === "")}
                />
              </Field>

              <Field
                label="Tanggal Surat Tugas"
                required
                error={submitted && tanggalSuratTugas.trim() === ""}
              >
                <input
                  type="date"
                  value={tanggalSuratTugas}
                  onChange={(e) => setTanggalSuratTugas(e.target.value)}
                  className={inputClass(submitted && tanggalSuratTugas.trim() === "")}
                />
              </Field>

              <Field
                label="Unit Kerja"
                required
                error={submitted && unitKerja.trim() === ""}
                className="sm:col-span-2"
              >
                <input
                  type="text"
                  placeholder="Nama unit kerja / direktorat"
                  value={unitKerja}
                  onChange={(e) => setUnitKerja(e.target.value)}
                  className={inputClass(submitted && unitKerja.trim() === "")}
                />
              </Field>
            </div>
          </Section>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={navigating}
              className="flex items-center gap-2 rounded-lg bg-esdm-gold px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-esdm-gold/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {navigating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Memproses…
                </>
              ) : (
                "Proses Laporan →"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// ── Layout helpers ──────────────────────────────────���─────────────────────────

function Section({
  title, required, optional, children,
}: {
  title: string; required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {required && (
          <span className="text-xs rounded-full bg-red-50 text-red-500 px-2 py-0.5 font-medium">Wajib</span>
        )}
        {optional && (
          <span className="text-xs rounded-full bg-slate-100 text-slate-400 px-2 py-0.5 font-medium">Opsional</span>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label, required, error, className, children,
}: {
  label: string; required?: boolean; error?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <FieldError>{label} wajib diisi.</FieldError>}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-400",
    "focus:outline-none focus:ring-2 transition-colors",
    hasError
      ? "border-red-400 focus:ring-red-300"
      : "border-slate-300 focus:ring-esdm-gold/30",
  ].join(" ");
}
