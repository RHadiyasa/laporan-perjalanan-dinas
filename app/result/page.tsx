"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
    // Guard: missing required store data → send back to step 1
    if (!store.extracted || !store.narrative || !store.files.undangan) {
      router.replace("/");
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
      // Convert all blob-URLs → base64 (images live in browser memory only)
      const [
        undanganB64,
        ...fotoB64s
      ] = await Promise.all([
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

      // Derive filename the same way the server does (for display purposes)
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
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-bold text-slate-800">
            Generator Laporan Perjalanan Dinas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kementerian ESDM</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <StepIndicator steps={STEPS} current={2} />

        {/* ── Generating ── */}
        {phase === "generating" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-sm font-medium text-slate-700">Membuat dokumen…</p>
            <p className="text-xs text-slate-500">
              Menyusun laporan dan menyematkan gambar. Ini mungkin memerlukan beberapa saat.
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {phase === "error" && errorMsg && (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 space-y-4">
            <div className="flex items-start gap-3">
              <ErrorIcon />
              <div>
                <p className="text-sm font-semibold text-red-700">Gagal membuat dokumen</p>
                <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => void generate()}
                className="rounded-lg bg-esdm-gold px-5 py-2 text-sm font-semibold text-white hover:bg-yellow-600 transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => router.push("/review")}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors"
              >
                Kembali ke Review
              </button>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {phase === "done" && docxBlob && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
            {/* Success header */}
            <div className="flex items-center gap-3">
              <SuccessIcon />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Dokumen berhasil dibuat!
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Laporan Pelaksanaan Perjalanan Dinas siap diunduh.
                </p>
              </div>
            </div>

            {/* Filename display */}
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <DocIcon />
              <span className="text-sm text-slate-700 font-medium truncate flex-1">
                {filename}
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {(docxBlob.size / 1024).toFixed(0)} KB
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 rounded-lg bg-esdm-gold px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-esdm-gold/50 transition-colors"
              >
                <DownloadIcon />
                Unduh Dokumen
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors"
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

// ── Icons ─────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="w-10 h-10 animate-spin text-esdm-gold"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
      <svg
        className="w-5 h-5 text-green-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
      <svg
        className="w-5 h-5 text-red-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      className="w-8 h-8 text-blue-500 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}
