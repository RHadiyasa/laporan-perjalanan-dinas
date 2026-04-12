export interface ExtractedData {
  perihal: string;
  tempat: string;
  hariTanggal: string;
  waktu: string;
  nomorSuratUndangan: string;
  tanggalSuratUndangan: string;
  pengirim: string;
  agenda: string;
}

export interface GeneratedNarrative {
  dasarPenugasan: string;
  partisipanKegiatan: string[];
  hasilPembahasan: string;
}

export interface ReportFiles {
  undangan: string;
  fotoKegiatan: string[];
  daftarHadir: string[];
  materiPresentasi: string[];
}

export interface ReportData {
  extracted: ExtractedData;
  narrative: GeneratedNarrative;
  nomorSuratTugas: string;
  tanggalSuratTugas: string;
  unitKerja: string;
  tempatPelaksanaan: string;
  files: ReportFiles;
  transcript: string;
}
