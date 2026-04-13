"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FileEntry {
  file: File;
  previewUrl: string | null;
  label: string; // display name (e.g. "invoice.pdf – hal. 1")
}

interface FileDropzoneProps {
  accept: string; // mime type string, e.g. "image/jpeg,image/png,application/pdf"
  maxFiles: number;
  label: string;
  description?: string;
  onFilesChange: (files: File[]) => void;
}

// ── PDF → image pages ─────────────────────────────────────────────────────────
// Loads pdfjs-dist v3 as a plain <script> tag from /pdfjs/pdf.min.js so that
// webpack never bundles it (avoids "Loading chunk … failed" errors).
// Files are copied to public/pdfjs/ via the postinstall script.

// Declare the global pdfjs library shape (minimal)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfjsLib: any;
  }
}

let pdfjsLoadPromise: Promise<void> | null = null;

function loadPdfjsScript(): Promise<void> {
  if (pdfjsLoadPromise) return pdfjsLoadPromise;

  pdfjsLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window !== "undefined" && window.pdfjsLib) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "/pdfjs/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
      resolve();
    };
    script.onerror = () => reject(new Error("Gagal memuat pdfjs dari /pdfjs/pdf.min.js"));
    document.head.appendChild(script);
  });

  return pdfjsLoadPromise;
}

async function pdfToImageFiles(
  file: File,
  maxPages: number
): Promise<Array<{ file: File; label: string }>> {
  await loadPdfjsScript();
  const pdfjs = window.pdfjsLib;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const numPages = Math.min(pdf.numPages as number, maxPages);
  const results: Array<{ file: File; label: string }> = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    // Scale to ~1.5× for good resolution; resizeImageFile will cap at MAX_DIMENSION
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob>((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
    );

    const baseName = file.name.replace(/\.pdf$/i, "");
    const imgFile = new File([blob], `${baseName}_hal${i}.jpg`, { type: "image/jpeg" });
    const label = numPages === 1 ? file.name : `${file.name} – hal. ${i}`;
    results.push({ file: imgFile, label });
  }

  return results;
}

// ── Image resize ─────────────────────────────────────────────────────────────

const MAX_DIMENSION = 1024;

function resizeImageFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = img;
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(file);
        return;
      }
      const scale = MAX_DIMENSION / Math.max(width, height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Gagal mengompres gambar.")); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.88
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Gagal membaca gambar.")); };
    img.src = objectUrl;
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isImageMime(mime: string) { return mime.startsWith("image/"); }
function isPdfMime(mime: string) { return mime === "application/pdf"; }
function acceptsImages(accept: string) { return accept.split(",").some((m) => isImageMime(m.trim())); }

function extractClipboardFiles(data: DataTransfer | null): File[] {
  if (!data) return [];
  const files: File[] = [];
  for (const item of Array.from(data.items)) {
    if (item.kind === "file") {
      const f = item.getAsFile();
      if (f) files.push(f);
    }
  }
  return files;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FileDropzone({
  accept,
  maxFiles,
  label,
  description,
  onFilesChange,
}: FileDropzoneProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedMimes = accept.split(",").map((m) => m.trim());

  function validateType(file: File) {
    return acceptedMimes.some((mime) => {
      if (mime.endsWith("/*")) return file.type.startsWith(mime.slice(0, -1));
      return file.type === mime;
    });
  }

  const processFiles = useCallback(
    async (incoming: File[]) => {
      setError(null);

      const validFiles = incoming.filter(validateType);
      if (validFiles.length < incoming.length) {
        setError("Satu atau beberapa file tidak didukung dan dilewati.");
      }

      setConverting(true);
      const processed: FileEntry[] = [];

      for (const file of validFiles) {
        setEntries((prev) => {
          const remaining = maxFiles - prev.length - processed.length;
          if (remaining <= 0) return prev;
          return prev; // placeholder update happens after processing
        });

        if (isPdfMime(file.type)) {
          // Convert PDF pages to images
          setEntries((prev) => {
            const remaining = maxFiles - prev.length;
            if (remaining <= 0) return prev;
            return prev;
          });

          const currentCount = processed.length;
          const remaining = maxFiles - currentCount;
          if (remaining <= 0) break;

          try {
            const pages = await pdfToImageFiles(file, remaining);
            for (const { file: imgFile, label } of pages) {
              const previewUrl = URL.createObjectURL(imgFile);
              processed.push({ file: imgFile, previewUrl, label });
              if (processed.length >= maxFiles) break;
            }
          } catch (err) {
            setError(`Gagal membaca PDF: ${err instanceof Error ? err.message : "error tidak diketahui"}`);
          }
        } else if (isImageMime(file.type) && acceptsImages(accept)) {
          const resized = await resizeImageFile(file);
          const previewUrl = URL.createObjectURL(resized);
          processed.push({ file: resized, previewUrl, label: file.name });
        } else {
          processed.push({ file, previewUrl: null, label: file.name });
        }

        if (processed.length >= maxFiles) break;
      }

      setEntries((prev) => {
        const merged = [...prev, ...processed].slice(0, maxFiles);
        onFilesChange(merged.map((e) => e.file));
        return merged;
      });
      setConverting(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accept, maxFiles, onFilesChange]
  );

  const isFull = entries.length >= maxFiles;

  function removeEntry(index: number) {
    setEntries((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index].previewUrl) URL.revokeObjectURL(prev[index].previewUrl!);
      onFilesChange(next.map((e) => e.file));
      return next;
    });
  }

  // Global paste: fires when mouse is hovering over this section (outer wrapper).
  // Targets the right dropzone in a multi-dropzone form without needing keyboard focus.
  useEffect(() => {
    if (!hovering || isFull) return;
    function handleWindowPaste(e: ClipboardEvent) {
      const files = extractClipboardFiles(e.clipboardData);
      if (files.length === 0) return;
      e.preventDefault();
      void processFiles(files);
    }
    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, [hovering, isFull, processFiles]);

  function onPaste(e: React.ClipboardEvent) {
    const files = extractClipboardFiles(e.clipboardData);
    if (files.length === 0) return;
    e.preventDefault();
    void processFiles(files);
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    void processFiles(Array.from(e.dataTransfer.files));
  }
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    void processFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Drop zone */}
      {!isFull && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onClick={() => !converting && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !converting && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPaste={onPaste}
          className={[
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-all duration-150",
            converting
              ? "cursor-wait border-slate-200 bg-slate-50"
              : dragging
              ? "cursor-pointer border-esdm-gold bg-yellow-50 scale-[1.01]"
              : hovering
              ? "cursor-pointer border-esdm-gold bg-yellow-50"
              : "cursor-pointer border-slate-300 bg-slate-50 hover:border-esdm-gold/50 hover:bg-yellow-50/50",
          ].join(" ")}
        >
          {converting ? (
            <>
              <SpinIcon />
              <p className="text-sm text-slate-500">Memproses file…</p>
            </>
          ) : hovering ? (
            <>
              <PasteIcon />
              <p className="text-sm font-semibold text-esdm-gold">Tempel di sini</p>
              <p className="text-xs text-slate-500">Tekan Ctrl+V untuk menempelkan gambar atau file</p>
              <p className="text-xs text-slate-400 mt-1">
                atau{" "}
                <span
                  className="underline underline-offset-2 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  pilih file
                </span>
              </p>
            </>
          ) : (
            <>
              <UploadIcon />
              <p className="text-sm text-slate-600">
                <span className="font-medium text-esdm-gold">Klik</span>
                {", "}seret &amp; lepas
                {", "}atau <span className="font-medium text-esdm-gold">Ctrl+V</span>
              </p>
              <p className="text-xs text-slate-400">
                {description ?? (maxFiles > 1
                  ? `Maks. ${maxFiles} file · ${accept.replace(/application\/pdf/g, "PDF").replace(/image\//g, "").toUpperCase()}`
                  : accept.replace(/application\/pdf/g, "PDF").replace(/image\//g, "").toUpperCase())}
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={onInputChange}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Previews */}
      {entries.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {entries.map((entry, i) => (
            <li
              key={i}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
            >
              {entry.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.previewUrl}
                  alt={entry.label}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-24 px-2">
                  <FileIcon />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{entry.label}</p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                aria-label={`Hapus ${entry.label}`}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <span className="text-xs leading-none">&times;</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {maxFiles > 1 && (
        <p className="text-xs text-slate-400 text-right">
          {entries.length} / {maxFiles}
        </p>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg className="w-6 h-6 animate-spin text-esdm-gold" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function PasteIcon() {
  return (
    <svg className="w-8 h-8 text-esdm-gold" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}
