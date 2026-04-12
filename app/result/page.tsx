"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReportStore } from "@/store/useReportStore";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { generateFileName } from "@/lib/file-naming";

const STEPS = [{ label: "Upload" }, { label: "Review" }, { label: "Unduh" }];

/** Convert a blob-URL or data-URL → base64 string (with data-URI prefix). */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read image: ${url}`));
    reader.readAsDataURL(blob);
  });
}

type Phase = "generating" | "done" | "error";

export default function ResultPage() {
  const router = useRouter();
  const store = useReportStore();

  const [phase, setPhase] = useState<Phase>("generating");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState<string>("");

  const didRun = useRef(false);

  useEffect(() => {
    if (!store.extracted || !store.narrative || !store.files.undangan) {
      router.replace("/generate");
      return;
    }

    if (didRun.current) return;
    didRun.current = true;

    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setPhase("generating");
    setErrorMsg(null);

    try {
      const [undanganB64, ...fotoB64s] = await Promise.all([
        urlToBase64(store.files.undangan),
        ...store.files.fotoKegiatan.map(urlToBase64),
      ]);

      const daftarHadirB64s = await Promise.all(
        store.files.daftarHadir.map(urlToBase64)
      );
      const materiB64s = await Promise.all(
        store.files.materiPresentasi.map(urlToBase64)
      );

      const body = {
        extracted: store.extracted,
        narrative: store.narrative,
        nomorSuratTugas: store.nomorSuratTugas,
        tanggalSuratTugas: store.tanggalSuratTugas,
        unitKerja: store.unitKerja,
        tempatPelaksanaan: store.tempatPelaksanaan,
        transcript: store.transcript,
        images: {
          undangan: undanganB64,
          fotoKegiatan: fotoB64s,
          daftarHadir: daftarHadirB64s,
          materiPresentasi: materiB64s,
        },
      };

      const res = await fetch("/api/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? `Server error: ${res.status}`);
      }

      const blob = await res.blob();
      const name = generateFileName(
        store.extracted!.hariTanggal,
        store.extracted!.perihal
      );
      setFilename(`${name}.docx`);
      setDocxBlob(blob);
      setPhase("done");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui."
      );
      setPhase("error");
    }
  }

  function handleDownload() {
    if (!docxBlob) return;
    const url = URL.createObjectURL(docxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    store.resetAll();
    router.push("/");
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
            href="/review"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Review
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <StepIndicator steps={STEPS} current={2} />

        {/* Generating */}
        {phase === "generating" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-600/10 flex items-center justify-center">
                <svg className="w-8 h-8 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Membuat dokumen…</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Menyusun laporan dan menyematkan gambar. Ini mungkin memerlukan beberapa saat.
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {phase === "error" && errorMsg && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Gagal membuat dokumen</p>
                <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => void generate()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 transition-opacity shadow-sm shadow-teal-200"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => router.push("/review")}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 rounded-xl border border-slate-200 hover:border-slate-300 hover:text-slate-800 transition-colors"
              >
                Kembali ke Review
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {phase === "done" && docxBlob && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
            {/* Success header */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-600/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">Dokumen berhasil dibuat!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Laporan Pelaksanaan Perjalanan Dinas siap diunduh.
                </p>
              </div>
            </div>

            {/* Filename display */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3.5">
              <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-sm text-slate-700 font-medium truncate flex-1">
                {filename}
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap bg-white border border-slate-100 rounded-lg px-2 py-1">
                {(docxBlob.size / 1024).toFixed(0)} KB
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-200 hover:opacity-90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Unduh Dokumen
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
              >
                Buat Laporan Baru
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
