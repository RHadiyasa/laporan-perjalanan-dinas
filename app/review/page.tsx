"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReportStore } from "@/store/useReportStore";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { MetadataEditor } from "@/components/review/MetadataEditor";
import { NarrativeEditor } from "@/components/review/NarrativeEditor";
import type { ExtractedData, GeneratedNarrative } from "@/types/report";

const STEPS = [{ label: "Upload" }, { label: "Review" }, { label: "Unduh" }];

async function blobUrlToBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, data] = dataUrl.split(",");
      const mimeType = header.replace("data:", "").replace(";base64", "");
      resolve({ base64: data, mimeType });
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(blob);
  });
}

type Phase = "idle" | "extracting" | "generating" | "done" | "error";

export default function ReviewPage() {
  const router = useRouter();
  const store = useReportStore();

  const [localExtracted, setLocalExtracted] = useState<ExtractedData | null>(
    store.extracted
  );
  const [localNarrative, setLocalNarrative] =
    useState<GeneratedNarrative | null>(store.narrative);

  const [phase, setPhase] = useState<Phase>(
    store.extracted && store.narrative ? "done" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const didRun = useRef(false);

  useEffect(() => {
    if (!store.files.undangan) {
      router.replace("/generate");
      return;
    }

    if (store.extracted && store.narrative) {
      setLocalExtracted(store.extracted);
      setLocalNarrative(store.narrative);
      setPhase("done");
      return;
    }

    if (didRun.current) return;
    didRun.current = true;

    void runPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runPipeline() {
    setPhase("extracting");
    setErrorMsg(null);

    try {
      const { base64, mimeType } = await blobUrlToBase64(store.files.undangan);

      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!extractRes.ok) {
        const { error } = (await extractRes.json()) as { error: string };
        throw new Error(`Ekstraksi gagal: ${error}`);
      }

      const extracted = (await extractRes.json()) as ExtractedData;
      store.setExtracted(extracted);
      setLocalExtracted(extracted);

      setPhase("generating");

      const narrativeRes = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted, transcript: store.transcript }),
      });

      if (!narrativeRes.ok) {
        const { error } = (await narrativeRes.json()) as { error: string };
        throw new Error(`Pembuatan narasi gagal: ${error}`);
      }

      const narrative = (await narrativeRes.json()) as GeneratedNarrative;
      store.setNarrative(narrative);
      setLocalNarrative(narrative);
      setPhase("done");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
      setErrorMsg(msg);
      setPhase("error");
    }
  }

  async function handleRegenerate() {
    if (!localExtracted) return;
    setIsRegenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extracted: localExtracted,
          transcript: store.transcript,
        }),
      });

      if (!res.ok) {
        const { error } = (await res.json()) as { error: string };
        throw new Error(error);
      }

      const narrative = (await res.json()) as GeneratedNarrative;
      store.setNarrative(narrative);
      setLocalNarrative(narrative);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Regenerasi gagal."
      );
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleGenerate() {
    if (!localExtracted || !localNarrative) return;

    const missing: string[] = [];
    if (!localExtracted.perihal.trim()) missing.push("Perihal");
    if (!localExtracted.tempat.trim()) missing.push("Tempat Kegiatan");
    if (!localExtracted.hariTanggal.trim()) missing.push("Hari dan Tanggal");
    if (!localNarrative.dasarPenugasan.trim()) missing.push("Dasar Penugasan");
    if (localNarrative.partisipanKegiatan.length === 0) missing.push("Partisipan Kegiatan");
    if (!localNarrative.hasilPembahasan.trim()) missing.push("Hasil Pembahasan");

    if (missing.length > 0) {
      setGenerateError(`Lengkapi field berikut sebelum melanjutkan: ${missing.join(", ")}.`);
      return;
    }

    setGenerateError(null);
    store.setExtracted(localExtracted);
    store.setNarrative(localNarrative);
    router.push("/result");
  }

  const isReady = phase === "done" && localExtracted && localNarrative;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-blue-600" />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
            href="/generate"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Upload
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <StepIndicator steps={STEPS} current={1} />

        {/* Loading states */}
        {(phase === "extracting" || phase === "generating") && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-4">
            <Spinner />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {phase === "extracting"
                  ? "Membaca surat undangan…"
                  : "Menghasilkan narasi laporan…"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {phase === "extracting"
                  ? "Visa sedang menganalisis dokumen dengan Vision AI."
                  : "Visa sedang menulis narasi formal dalam Bahasa Indonesia."}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {phase === "error" && errorMsg && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center mt-0.5">
                <svg className="w-4.5 h-4.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Terjadi kesalahan</p>
                <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => {
                didRun.current = false;
                void runPipeline();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm shadow-teal-200"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Inline error for regenerate */}
        {isReady && errorMsg && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Main two-column editor */}
        {isReady && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* Left: metadata */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-800 mb-4">Data Kegiatan</h2>
                <MetadataEditor
                  extracted={localExtracted}
                  nomorSuratTugas={store.nomorSuratTugas}
                  tanggalSuratTugas={store.tanggalSuratTugas}
                  unitKerja={store.unitKerja}
                  tempatPelaksanaan={store.tempatPelaksanaan}
                  onExtractedChange={setLocalExtracted}
                  onMetaChange={store.setMetadata}
                />
              </div>

              {/* Right: narrative */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <NarrativeEditor
                  narrative={localNarrative}
                  isRegenerating={isRegenerating}
                  onChange={setLocalNarrative}
                  onRegenerate={handleRegenerate}
                />
              </div>
            </div>

            {/* Transcript reference (collapsible) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setTranscriptOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Transcript / Catatan Rapat <span className="text-xs text-slate-400 font-normal">(referensi)</span></span>
                <ChevronIcon open={transcriptOpen} />
              </button>
              {transcriptOpen && (
                <div className="px-5 pb-5">
                  <pre className="whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 rounded-xl p-4 max-h-64 overflow-y-auto border border-slate-100">
                    {store.transcript || "(kosong)"}
                  </pre>
                </div>
              )}
            </div>

            {/* Generate button */}
            <div className="flex flex-col items-end gap-2 pb-4">
              {generateError && (
                <p className="text-xs text-red-500 text-right max-w-md">{generateError}</p>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isRegenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Memproses…
                  </>
                ) : (
                  <>
                    Generate Laporan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="w-6 h-6 animate-spin text-teal-500 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
