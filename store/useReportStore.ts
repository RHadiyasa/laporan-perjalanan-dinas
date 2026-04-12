import { create } from "zustand";
import type {
  ExtractedData,
  GeneratedNarrative,
  ReportFiles,
} from "@/types/report";

interface ReportState {
  // Data
  extracted: ExtractedData | null;
  narrative: GeneratedNarrative | null;
  nomorSuratTugas: string;
  tanggalSuratTugas: string;
  unitKerja: string;
  tempatPelaksanaan: string;
  files: ReportFiles;
  transcript: string;

  // Computed
  isStep1Complete: () => boolean;
  isStep2Complete: () => boolean;

  // Actions
  setExtracted: (data: ExtractedData) => void;
  setNarrative: (data: GeneratedNarrative) => void;
  setFiles: (files: Partial<ReportFiles>) => void;
  setMetadata: (meta: {
    nomorSuratTugas?: string;
    tanggalSuratTugas?: string;
    unitKerja?: string;
    tempatPelaksanaan?: string;
  }) => void;
  setTranscript: (transcript: string) => void;
  resetAll: () => void;
}

const emptyFiles: ReportFiles = {
  undangan: "",
  fotoKegiatan: [],
  daftarHadir: [],
  materiPresentasi: [],
};

const initialState = {
  extracted: null,
  narrative: null,
  nomorSuratTugas: "",
  tanggalSuratTugas: "",
  unitKerja: "",
  tempatPelaksanaan: "",
  files: emptyFiles,
  transcript: "",
};

export const useReportStore = create<ReportState>()((set, get) => ({
  ...initialState,

  isStep1Complete: () => {
    const { files, transcript, nomorSuratTugas, tanggalSuratTugas, unitKerja } = get();
    return (
      files.undangan !== "" &&
      files.fotoKegiatan.length > 0 &&
      files.daftarHadir.length > 0 &&
      transcript.trim() !== "" &&
      nomorSuratTugas.trim() !== "" &&
      tanggalSuratTugas.trim() !== "" &&
      unitKerja.trim() !== ""
    );
  },

  isStep2Complete: () => {
    const { extracted, narrative } = get();
    if (!extracted || !narrative) return false;
    return (
      extracted.perihal.trim() !== "" &&
      extracted.tempat.trim() !== "" &&
      extracted.hariTanggal.trim() !== "" &&
      narrative.dasarPenugasan.trim() !== "" &&
      narrative.partisipanKegiatan.length > 0 &&
      narrative.hasilPembahasan.trim() !== ""
    );
  },

  setExtracted: (data) =>
    set((state) => ({
      extracted: data,
      // Auto-fill tempatPelaksanaan from extracted.tempat on first extraction
      tempatPelaksanaan: state.tempatPelaksanaan || data.tempat,
    })),

  setNarrative: (data) => set({ narrative: data }),

  setFiles: (partial) =>
    set((state) => ({ files: { ...state.files, ...partial } })),

  setMetadata: (meta) => set(meta),

  setTranscript: (transcript) => set({ transcript }),

  resetAll: () => set(initialState),
}));
