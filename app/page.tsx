import Link from "next/link";
import { SiteNav } from "@/components/shared/SiteNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-teal-200/40 to-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-200/40 to-teal-200/30 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 border border-teal-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-medium text-teal-700">Didukung oleh Visa AI · Claude Sonnet</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight tracking-tight mb-5">
            Laporan Perjalanan Dinas{" "}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              dalam Hitungan Menit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            Unggah surat undangan, foto kegiatan, dan daftar hadir.
            Biarkan <strong className="text-teal-700 font-semibold">Visa</strong> — AI kami — membaca dokumen,
            menyusun narasi formal, dan menghasilkan file{" "}
            <span className="font-medium">.docx</span> yang siap digunakan.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/generate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-teal-200"
            >
              Mulai Buat Laporan
              <ArrowRightIcon />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-teal-700 rounded-xl bg-white border border-teal-200 hover:bg-teal-50 transition-colors shadow-sm"
            >
              <BookIcon />
              Lihat Dokumentasi
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { value: "< 1 menit", label: "Waktu ekstraksi data" },
              { value: "5 halaman", label: "Struktur laporan lengkap" },
              { value: "100% gratis", label: "Tanpa biaya, tanpa login" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionLabel>Cara Kerja</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 mb-12 text-center">
            Tiga langkah, laporan selesai
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-teal-200 to-blue-200" />

            {[
              {
                step: "01",
                title: "Upload Dokumen",
                desc: "Unggah surat undangan (PDF/gambar), foto kegiatan, daftar hadir, dan opsional materi presentasi. Bisa klik, drag & drop, atau tempel Ctrl+V.",
                icon: <UploadStepIcon />,
                color: "from-teal-500 to-teal-400",
              },
              {
                step: "02",
                title: "Review dengan Visa AI",
                desc: "Visa membaca surat undangan dan mengekstrak data otomatis, lalu menyusun narasi laporan formal. Anda dapat mengedit semua hasil sebelum lanjut.",
                icon: <ReviewStepIcon />,
                color: "from-cyan-500 to-blue-500",
              },
              {
                step: "03",
                title: "Unduh Laporan",
                desc: "Klik Generate — dokumen .docx lengkap 5 halaman langsung terunduh. Siap cetak sesuai format standar Kementerian ESDM.",
                icon: <DownloadStepIcon />,
                color: "from-blue-500 to-blue-600",
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-4`}>
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-300 mb-1 tracking-widest">{item.step}</span>
                <h3 className="font-bold text-slate-800 text-base mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionLabel>Fitur</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 mb-12 text-center">
            Semua yang Anda butuhkan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <FeatDocIcon />,
                title: "Multi-format Upload",
                desc: "Mendukung JPEG, PNG, WEBP, dan PDF. File PDF dikonversi otomatis menjadi gambar halaman per halaman.",
              },
              {
                icon: <FeatAiIcon />,
                title: "Ekstraksi Cerdas",
                desc: "Visa membaca surat undangan dan mengekstrak perihal, tempat, tanggal, nomor surat, pengirim, dan agenda secara otomatis.",
              },
              {
                icon: <FeatEditIcon />,
                title: "Review & Edit",
                desc: "Semua data hasil AI dapat diedit sebelum generate. Tersedia tombol Regenerasi Narasi untuk mencoba narasi alternatif.",
              },
              {
                icon: <FeatDocxIcon />,
                title: "Output Docx Formal",
                desc: "Laporan 5 halaman: narasi utama, dokumentasi foto, daftar hadir, dan lampiran undangan — sesuai format ESDM.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 flex items-center justify-center mb-4 group-hover:from-teal-100 group-hover:to-blue-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Visa ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 p-px shadow-xl shadow-teal-200">
            <div className="rounded-3xl bg-white p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-200">
                  <VisaIcon />
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Tenaga Penggerak</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
                    Ditenagai oleh Visa AI
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    <strong className="text-slate-800">Visa</strong> adalah AI yang kami bangun di atas{" "}
                    <strong className="text-slate-800">Claude Sonnet</strong> dari Anthropic — model yang dirancang
                    untuk memahami dokumen, menulis narasi formal, dan bekerja akurat dalam bahasa Indonesia pemerintahan.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Visa Vision", desc: "Membaca & mengekstrak data dari gambar surat undangan" },
                      { label: "Visa Language", desc: "Menyusun narasi laporan formal berbahasa Indonesia baku" },
                    ].map((cap) => (
                      <div key={cap.label} className="flex gap-3 p-3 rounded-xl bg-teal-50 border border-teal-100">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-teal-800">{cap.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{cap.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/docs#visa-ai" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                    Pelajari lebih lanjut tentang Visa
                    <ArrowRightSmIcon />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            Siap membuat laporan?
          </h2>
          <p className="text-sm text-slate-500 mb-7">
            Tidak perlu registrasi. Cukup siapkan dokumen dan mulai dalam hitungan detik.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-teal-200"
          >
            Mulai Buat Laporan Sekarang
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">SPD</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">SPD Generator</span>
            <span className="text-xs text-slate-400">· Kementerian ESDM</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500">
            <a
              href="https://wa.me/6289693919042"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-teal-600 transition-colors"
            >
              <WaIcon />
              089693919042
            </a>
            <a
              href="mailto:rafihadiyasa32@gmail.com"
              className="flex items-center gap-1.5 hover:text-teal-600 transition-colors"
            >
              <MailIcon />
              rafihadiyasa32@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/docs" className="hover:text-teal-600 transition-colors">Dokumentasi</Link>
            <Link href="/generate" className="hover:text-teal-600 transition-colors">Generator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-xs font-bold uppercase tracking-widest text-teal-600 mb-1">
      {children}
    </p>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ArrowRightSmIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function UploadStepIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function ReviewStepIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

function DownloadStepIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function FeatDocIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function FeatAiIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function FeatEditIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function FeatDocxIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function VisaIcon() {
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function WaIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.85L.057 23.177a.75.75 0 00.92.92l5.327-1.465A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.51-5.174-1.399l-.37-.216-3.838 1.056 1.056-3.838-.216-.37A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}
