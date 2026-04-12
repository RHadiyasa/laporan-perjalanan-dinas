"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReportStore } from "@/store/useReportStore";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { MetadataEditor } from "@/components/review/MetadataEditor";
import { NarrativeEditor } from "@/components/review/NarrativeEditor";
import type { ExtractedData, GeneratedNarrative } from "@/types/report";

const STEPS = [{ label: "Upload" }, { label: "Review" }, { label: "Unduh" }];

// Convert a blob/object URL → base64 string + mimeType
async function blobUrlToBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // dataUrl = "data:<mime>;base64,<data>"
      const [header, data] = dataUrl.split(",");
      const mimeType = header.replace("data:", "").replace(";base64", "");
      resolve({ base64: data, mimeType });
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(blob);
  });
}

type Phase =
  | "idle"
  | "extracting"
  | "generating"
  | "done"
  | "error";

export default function ReviewPage() {
  const router = useRouter();
  const store = useReportStore();

  // Local editable copies — initialised from store once AI results arrive
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

  // Run AI pipeline only once on mount
  const didRun = useRef(false);

  useEffect(() => {
    // Guard: step 1 must be complete — undangan + transcript are the key proxies
    if (!store.files.undangan || !store.transcript) {
      router.replace("/");
      return;
    }

    // If we already have results (e.g. user navigated back), skip API calls
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
      // Step A: extract invitation data via Vision
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

      // Step B: generate narrative
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

    // Validate required narrative fields before proceeding
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
    // Persist any manual edits back to the store before navigating
    store.setExtracted(localExtracted);
    store.setNarrative(localNarrative);
    router.push("/result");
  }

  const isReady = phase === "done" && localExtracted && localNarrative;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-lg font-bold text-slate-800">
            Generator Laporan Perjalanan Dinas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kementerian ESDM</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <StepIndicator steps={STEPS} current={1} />

        {/* ── Loading states ── */}
        {(phase === "extracting" || phase === "generating") && (
          <StatusCard>
            <Spinner />
            <div>
              <p className="font-medium text-slate-700">
                {phase === "extracting"
                  ? "Membaca surat undangan…"
                  : "Menghasilkan narasi laporan…"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {phase === "extracting"
                  ? "Visa sedang menganalisis dokumen."
                  : "Visa sedang menulis narasi formal dalam Bahasa Indonesia."}
              </p>
            </div>
          </StatusCard>
        )}

        {/* ── Error state ── */}
        {phase === "error" && errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm font-medium text-red-700">
              Terjadi kesalahan
            </p>
            <p className="text-sm text-red-600">{errorMsg}</p>
            <button
              onClick={() => {
                didRun.current = false;
                void runPipeline();
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── Inline error for regenerate ── */}
        {isReady && errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* ── Main two-column editor ── */}
        {isReady && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left: metadata */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">
                  Data Kegiatan
                </h2>
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <NarrativeEditor
                  narrative={localNarrative}
                  isRegenerating={isRegenerating}
                  onChange={setLocalNarrative}
                  onRegenerate={handleRegenerate}
                />
              </div>
            </div>

            {/* ── Transcript reference (collapsible) ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setTranscriptOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Transcript / Catatan Rapat (referensi)</span>
                <ChevronIcon open={transcriptOpen} />
              </button>
              {transcriptOpen && (
                <div className="px-5 pb-5">
                  <pre className="whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {store.transcript || "(kosong)"}
                  </pre>
                </div>
              )}
            </div>

            {/* ── Generate button ── */}
            <div className="flex flex-col items-end gap-2 pb-4">
              {generateError && (
                <p className="text-xs text-red-500 text-right max-w-md">{generateError}</p>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isRegenerating}
                className="rounded-lg bg-esdm-gold px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-esdm-gold/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Laporan →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="w-6 h-6 animate-spin text-esdm-gold flex-shrink-0"
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
