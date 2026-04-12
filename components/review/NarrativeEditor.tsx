"use client";

import type { GeneratedNarrative } from "@/types/report";

interface NarrativeEditorProps {
  narrative: GeneratedNarrative;
  isRegenerating: boolean;
  onChange: (data: GeneratedNarrative) => void;
  onRegenerate: () => void;
}

export function NarrativeEditor({
  narrative,
  isRegenerating,
  onChange,
  onRegenerate,
}: NarrativeEditorProps) {
  // partisipanKegiatan edited as one participant per line
  const partisipanText = narrative.partisipanKegiatan.join("\n");

  function updatePartisipan(text: string) {
    onChange({
      ...narrative,
      partisipanKegiatan: text
        .split("\n")
        .map((l) => l.trimStart())
        .filter((l) => l !== ""),
    });
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Narasi Laporan</h2>
        <RegenerateButton loading={isRegenerating} onClick={onRegenerate} />
      </div>

      {/* ── Dasar Penugasan ── */}
      <NarrativeSection label="A. Dasar Penugasan">
        <textarea
          rows={4}
          value={narrative.dasarPenugasan}
          onChange={(e) =>
            onChange({ ...narrative, dasarPenugasan: e.target.value })
          }
          className={textareaClass}
          disabled={isRegenerating}
        />
      </NarrativeSection>

      {/* ── Partisipan Kegiatan ── */}
      <NarrativeSection
        label="B. Partisipan Kegiatan"
        hint="Satu peserta / institusi per baris"
      >
        <textarea
          rows={5}
          value={partisipanText}
          onChange={(e) => updatePartisipan(e.target.value)}
          className={textareaClass}
          disabled={isRegenerating}
          placeholder="Perwakilan Direktorat Jenderal ..."
        />
        {narrative.partisipanKegiatan.length > 0 && (
          <p className="text-xs text-slate-400 mt-1">
            {narrative.partisipanKegiatan.length} peserta
          </p>
        )}
      </NarrativeSection>

      {/* ── Hasil Pembahasan ── */}
      <NarrativeSection label="C. Hasil Pembahasan">
        <textarea
          rows={12}
          value={narrative.hasilPembahasan}
          onChange={(e) =>
            onChange({ ...narrative, hasilPembahasan: e.target.value })
          }
          className={`${textareaClass} resize-y`}
          disabled={isRegenerating}
        />
        <p className="text-xs text-slate-400 mt-1">
          Pisahkan paragraf dengan baris kosong.
        </p>
      </NarrativeSection>

      {/* Overlay spinner when regenerating */}
      {isRegenerating && (
        <div className="flex items-center gap-2 text-sm text-esdm-gold">
          <Spinner />
          <span>Menghasilkan ulang narasi…</span>
        </div>
      )}
    </div>
  );
}

function NarrativeSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function RegenerateButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-esdm-gold hover:text-esdm-gold disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <>
          <Spinner className="text-esdm-gold" />
          Generating…
        </>
      ) : (
        <>
          <RefreshIcon />
          Regenerate
        </>
      )}
    </button>
  );
}

function Spinner({ className = "text-current" }: { className?: string }) {
  return (
    <svg
      className={`w-3.5 h-3.5 animate-spin ${className}`}
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

function RefreshIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

const textareaClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 " +
  "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-esdm-gold/30 " +
  "transition-colors disabled:bg-slate-50 disabled:text-slate-400";
