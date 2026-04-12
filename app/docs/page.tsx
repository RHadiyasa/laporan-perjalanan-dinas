import Link from "next/link";
import { SiteNav } from "@/components/shared/SiteNav";

const TOC = [
  { id: "gambaran-umum",        label: "Gambaran Umum" },
  { id: "persiapan",            label: "Persiapan Dokumen" },
  { id: "cara-penggunaan",      label: "Cara Penggunaan" },
  { id: "visa-ai",              label: "Tentang Visa AI" },
  { id: "proses-teknis",        label: "Proses di Balik Layar" },
  { id: "struktur-output",      label: "Struktur Dokumen Output" },
  { id: "tips",                 label: "Tips & Praktik Terbaik" },
  { id: "faq",                  label: "FAQ" },
  { id: "kontak",               label: "Kontak & Bantuan" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Dokumentasi</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2">
            Panduan Lengkap SPD Generator
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Panduan penggunaan, penjelasan teknis, dan informasi tentang Visa AI
            yang menggerakkan proses pembuatan laporan.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 items-start">

          {/* ── Sidebar TOC (sticky desktop) ──────────────────────────────── */}
          <aside className="hidden lg:block sticky top-20 self-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
              Daftar Isi
            </p>
            <nav className="space-y-0.5">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block px-3 py-2 text-sm text-slate-600 rounded-lg hover:text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-6 p-3 rounded-xl bg-teal-50 border border-teal-100">
              <p className="text-xs text-teal-700 font-medium mb-2">Siap mencoba?</p>
              <Link
                href="/generate"
                className="block text-center text-xs font-bold text-white py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 transition-opacity"
              >
                Mulai Buat Laporan →
              </Link>
            </div>
          </aside>

          {/* ── Main content ──────────────────────────────────────────────── */}
          <article className="prose-custom space-y-14">

            {/* ── 1. Gambaran Umum ─────────────────────────────────────────── */}
            <Section id="gambaran-umum" title="Gambaran Umum">
              <p>
                <strong>SPD Generator</strong> adalah aplikasi web yang dirancang khusus untuk membantu
                Aparatur Sipil Negara (ASN) Kementerian ESDM dalam menyusun dokumen{" "}
                <em>Laporan Pelaksanaan Perjalanan Dinas</em> secara otomatis dan efisien.
              </p>
              <p>
                Dengan dukungan kecerdasan buatan yang kami beri nama <strong>Visa</strong>,
                aplikasi ini mampu membaca surat undangan, mengekstrak informasi penting,
                menyusun narasi laporan formal dalam gaya bahasa pemerintahan Indonesia,
                dan menghasilkan file <code>.docx</code> yang siap cetak — semuanya
                dalam hitungan menit.
              </p>
              <InfoBox>
                SPD Generator bersifat <strong>stateless</strong> — tidak ada akun, tidak ada
                database, dan tidak ada data yang disimpan secara permanen. Semua pemrosesan
                terjadi sementara dan langsung dihapus setelah selesai.
              </InfoBox>
            </Section>

            {/* ── 2. Persiapan ─────────────────────────────────────────────── */}
            <Section id="persiapan" title="Persiapan Dokumen">
              <p>Sebelum memulai, siapkan dokumen berikut:</p>

              <h3>Dokumen Wajib</h3>
              <DocList items={[
                {
                  title: "Surat Undangan",
                  desc: "Dokumen resmi undangan rapat atau kegiatan. Format: JPEG, PNG, WEBP, atau PDF. Pastikan seluruh teks terbaca dengan jelas — kualitas gambar memengaruhi akurasi ekstraksi Visa.",
                },
                {
                  title: "Foto Kegiatan",
                  desc: "Dokumentasi foto selama kegiatan berlangsung. Format: JPEG, PNG, atau WEBP. Maksimum 5 foto. Gambar disimpan dalam ukuran asli dan ditampilkan di bagian Dokumentasi Kegiatan.",
                },
                {
                  title: "Daftar Hadir",
                  desc: "Lembar absensi peserta kegiatan. Format: JPEG atau PNG. Maksimum 2 halaman.",
                },
              ]} />

              <h3 className="mt-4">Dokumen Opsional (Sangat Dianjurkan)</h3>
              <DocList items={[
                {
                  title: "Materi Presentasi",
                  desc: "Slide atau materi yang digunakan selama kegiatan. Format: JPEG, PNG, WEBP, atau PDF. Maksimum 10 halaman. Materi ini akan dilampirkan di bagian Hasil Pembahasan.",
                },
                {
                  title: "Transcript / Catatan Rapat",
                  desc: "Notulen rapat, poin-poin hasil diskusi, atau transcript rekaman. Format teks (copy-paste). Semakin lengkap transcript, semakin detail dan akurat narasi Hasil Pembahasan yang dihasilkan Visa.",
                },
              ]} />

              <h3 className="mt-4">Data Manual yang Perlu Diisi</h3>
              <ul>
                <li><strong>Nomor Surat Tugas</strong> — contoh: <code>123/ST/EBTKE.2/2025</code></li>
                <li><strong>Tanggal Surat Tugas</strong></li>
                <li><strong>Unit Kerja / Direktorat</strong></li>
                <li><strong>Tempat Pelaksanaan Kegiatan</strong> — terisi otomatis dari undangan, dapat diubah di halaman Review</li>
              </ul>
            </Section>

            {/* ── 3. Cara Penggunaan ───────────────────────────────────────── */}
            <Section id="cara-penggunaan" title="Cara Penggunaan">

              <StepBlock number={1} title="Upload Dokumen">
                <p>
                  Buka halaman upload melalui tombol <strong>"Mulai Buat Laporan"</strong> di
                  beranda, atau langsung akses <code>/generate</code>.
                </p>
                <p className="font-semibold mt-3 mb-1">Cara mengupload file:</p>
                <ul>
                  <li><strong>Klik</strong> — klik area dropzone untuk membuka file browser</li>
                  <li><strong>Drag &amp; Drop</strong> — seret file langsung ke area dropzone</li>
                  <li>
                    <strong>Tempel (Ctrl+V)</strong> — arahkan kursor ke area dropzone yang
                    diinginkan, lalu tekan <kbd>Ctrl+V</kbd>. Berguna untuk screenshot atau
                    gambar yang disalin dari aplikasi lain.
                  </li>
                </ul>
                <InfoBox>
                  File PDF dikonversi otomatis menjadi gambar di browser menggunakan PDF.js.
                  Setiap halaman PDF menjadi satu file gambar JPEG terpisah.
                </InfoBox>
                <p className="mt-3">
                  Setelah semua dokumen diupload dan data surat tugas diisi, klik{" "}
                  <strong>"Proses Laporan →"</strong>.
                </p>
              </StepBlock>

              <StepBlock number={2} title="Review Data — Visa Bekerja">
                <p>
                  Setelah mengklik "Proses Laporan", Anda akan diarahkan ke halaman Review.
                  Visa akan bekerja dalam dua tahap secara berurutan:
                </p>

                <SubStep title="Tahap A: Ekstraksi Data (Visa Vision)">
                  <p>
                    Visa membaca gambar surat undangan dan mengekstrak informasi berikut secara
                    otomatis:
                  </p>
                  <div className="grid grid-cols-2 gap-2 my-3">
                    {[
                      "Perihal / agenda kegiatan",
                      "Tempat kegiatan",
                      "Hari dan tanggal",
                      "Waktu kegiatan",
                      "Nomor surat undangan",
                      "Tanggal surat undangan",
                      "Nama pengirim / instansi",
                      "Agenda rapat",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </SubStep>

                <SubStep title="Tahap B: Pembuatan Narasi (Visa Language)">
                  <p>
                    Berdasarkan data yang diekstrak dan transcript yang Anda berikan, Visa
                    menyusun tiga bagian narasi laporan:
                  </p>
                  <ul>
                    <li>
                      <strong>Dasar Penugasan</strong> — paragraf formal yang menjelaskan
                      dasar hukum dan alasan penugasan mengacu pada surat tugas.
                    </li>
                    <li>
                      <strong>Partisipan Kegiatan</strong> — daftar nama dan jabatan peserta
                      yang hadir, disusun berdasarkan transcript atau data undangan.
                    </li>
                    <li>
                      <strong>Hasil Pembahasan</strong> — narasi detail tentang apa yang
                      dibahas, didiskusikan, dan disimpulkan selama kegiatan. Semakin
                      lengkap transcript, semakin detail hasil yang dihasilkan Visa.
                    </li>
                  </ul>
                </SubStep>

                <p className="mt-3">Setelah proses selesai, Anda dapat:</p>
                <ul>
                  <li><strong>Mengedit semua field</strong> secara langsung di form review</li>
                  <li>
                    <strong>Mengklik "Regenerasi Narasi"</strong> untuk membuat narasi
                    ulang jika hasil pertama kurang sesuai — Visa akan menghasilkan
                    versi yang berbeda
                  </li>
                  <li>
                    <strong>Memverifikasi Tempat Pelaksanaan</strong> di bagian Data Surat
                    Tugas — nilai ini yang akan muncul di baris tanda tangan dokumen
                    (contoh: <em>Jakarta Selatan, 10 April 2026</em>)
                  </li>
                </ul>
                <p className="mt-3">
                  Klik <strong>"Generate Laporan →"</strong> jika semua data sudah benar.
                </p>
              </StepBlock>

              <StepBlock number={3} title="Download Laporan">
                <p>
                  Visa menyusun dokumen <code>.docx</code> di server. Proses ini berlangsung
                  beberapa detik. Setelah selesai, tombol download akan muncul secara otomatis.
                </p>
                <p className="mt-2">
                  Nama file menggunakan format otomatis:{" "}
                  <code>YYYYMMDD_Laporan SPD [Perihal Kegiatan].docx</code>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Contoh: <em>20260402_Laporan SPD Pelaksanaan PMPZI Kementerian ESDM TA 2025.docx</em>
                </p>
              </StepBlock>
            </Section>

            {/* ── 4. Tentang Visa AI ───────────────────────────────────────── */}
            <Section id="visa-ai" title="Tentang Visa AI">
              <p>
                <strong>Visa</strong> adalah nama yang kami berikan untuk sistem kecerdasan buatan
                yang menggerakkan SPD Generator. Visa ditenagai oleh{" "}
                <strong>Claude Sonnet</strong> — model AI generasi terbaru dari{" "}
                <strong>Anthropic</strong>, perusahaan riset AI terkemuka yang berfokus pada
                keamanan dan keandalan AI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <CapabilityCard
                  icon="👁"
                  title="Visa Vision"
                  subtitle="Ekstraksi Dokumen"
                  desc="Visa 'melihat' gambar surat undangan menggunakan computer vision. Teknologi ini memungkinkan Visa membaca teks dalam gambar (bukan OCR biasa, tapi pemahaman konteks), memahami struktur dokumen pemerintah, dan mengidentifikasi field-field penting dengan akurat."
                />
                <CapabilityCard
                  icon="✍️"
                  title="Visa Language"
                  subtitle="Pembuatan Narasi"
                  desc="Setelah data diekstrak, Visa menggunakan kemampuan bahasa untuk menyusun narasi dalam bahasa Indonesia formal dan baku, mengikuti gaya penulisan laporan perjalanan dinas pemerintah, dan mengintegrasikan informasi dari transcript secara koheren."
                />
              </div>

              <InfoBox>
                Model Claude dirancang dengan pendekatan <em>Constitutional AI</em> — artinya
                model dilatih untuk menghasilkan output yang akurat, jujur, dan aman.
                Visa tidak akan mengarang informasi yang tidak ada dalam dokumen sumber.
              </InfoBox>
            </Section>

            {/* ── 5. Proses Teknis ─────────────────────────────────────────── */}
            <Section id="proses-teknis" title="Proses di Balik Layar">
              <p>
                Berikut penjelasan teknis tentang apa yang terjadi di setiap tahap:
              </p>

              <TechStep number={1} title="Upload & Penyimpanan Sementara (Browser)">
                <p>
                  Saat Anda mengupload file, tidak ada yang dikirim ke server. Browser
                  membuat <em>Object URL</em> — alamat URL sementara yang merujuk ke
                  file di memori browser. File tetap di komputer Anda selama tahap ini.
                </p>
                <p className="mt-2">
                  File PDF dikonversi langsung di browser menggunakan{" "}
                  <strong>PDF.js</strong> (dimuat sebagai script dari <code>/pdfjs/</code>).
                  Setiap halaman di-render ke HTML Canvas dan dikonversi menjadi JPEG.
                </p>
              </TechStep>

              <TechStep number={2} title="Ekstraksi Data — /api/extract">
                <ol className="space-y-1">
                  <li>Browser mengambil gambar undangan dari Object URL</li>
                  <li>Gambar dikonversi ke format Base64 (string teks)</li>
                  <li>Base64 dikirim ke endpoint <code>/api/extract</code> via POST JSON</li>
                  <li>
                    Server mengirim gambar ke <strong>Claude API</strong> dengan prompt:{" "}
                    <em>"Ekstrak data dari surat undangan ini dan kembalikan sebagai JSON."</em>
                  </li>
                  <li>Claude merespons dengan JSON berisi semua field yang diperlukan</li>
                  <li>Data dikembalikan ke browser dan ditampilkan di form review</li>
                </ol>
                <CodeBlock>
                  {`// Field yang diekstrak Visa:
{
  perihal: string,
  tempat: string,
  hariTanggal: string,
  waktu: string,
  nomorSuratUndangan: string,
  tanggalSuratUndangan: string,
  pengirim: string,
  agenda: string
}`}
                </CodeBlock>
              </TechStep>

              <TechStep number={3} title="Pembuatan Narasi — /api/generate-narrative">
                <ol className="space-y-1">
                  <li>Data yang diekstrak + transcript dikirim ke <code>/api/generate-narrative</code></li>
                  <li>
                    Server membuat prompt yang menginstruksikan Visa untuk menulis laporan
                    formal sesuai gaya pemerintahan Indonesia
                  </li>
                  <li>Claude menghasilkan teks narasi terstruktur</li>
                  <li>Narasi dikembalikan ke browser dalam JSON terstruktur</li>
                </ol>
                <CodeBlock>
                  {`// Output narasi Visa:
{
  dasarPenugasan: string,       // paragraf formal
  partisipanKegiatan: string[], // daftar peserta
  hasilPembahasan: string       // narasi pembahasan
}`}
                </CodeBlock>
              </TechStep>

              <TechStep number={4} title="Pembuatan Dokumen — /api/generate-docx">
                <ol className="space-y-1">
                  <li>Semua gambar dikonversi ke Base64 di browser</li>
                  <li>
                    Semua data (metadata, narasi, gambar) dikirim ke{" "}
                    <code>/api/generate-docx</code>
                  </li>
                  <li>
                    Server menggunakan library <strong>docx-js</strong> untuk membangun
                    dokumen .docx programatik
                  </li>
                  <li>
                    Dokumen dibuat dengan spesifikasi: ukuran A4, font Times New Roman 12pt,
                    header berlogo ESDM, warna brand biru tua, layout formal
                  </li>
                  <li>Binary file .docx dikirim kembali ke browser</li>
                  <li>Browser memicu download otomatis</li>
                </ol>
                <InfoBox>
                  <strong>Data tidak pernah disimpan di server.</strong> Semua pemrosesan
                  bersifat stateless — setiap request berdiri sendiri. Tidak ada database,
                  tidak ada penyimpanan file, tidak ada log konten dokumen.
                </InfoBox>
              </TechStep>
            </Section>

            {/* ── 6. Struktur Output ───────────────────────────────────────── */}
            <Section id="struktur-output" title="Struktur Dokumen Output">
              <p>
                Dokumen <code>.docx</code> yang dihasilkan terdiri dari 5 halaman dengan
                struktur berikut:
              </p>
              <div className="space-y-3 mt-4">
                {[
                  {
                    page: "Hal. 1–2",
                    title: "Laporan Utama",
                    items: [
                      "Header dengan logo Kementerian ESDM dan judul laporan",
                      "Tabel metadata: perihal, tempat, hari/tanggal, nomor surat tugas",
                      "Bagian A: Dasar Penugasan",
                      "Bagian B: Partisipan Kegiatan",
                      "Bagian C: Hasil Pembahasan (termasuk materi presentasi jika ada)",
                      "Tanda tangan Pelaksana Perjalanan Dinas",
                    ],
                  },
                  {
                    page: "Hal. 3",
                    title: "Dokumentasi Kegiatan",
                    items: ["Foto-foto kegiatan ditampilkan proporsional dalam layout terstruktur"],
                  },
                  {
                    page: "Hal. 4",
                    title: "Daftar Hadir",
                    items: ["Gambar lembar daftar hadir dalam ukuran proporsional"],
                  },
                  {
                    page: "Hal. 5",
                    title: "Surat Undangan",
                    items: ["Gambar surat undangan asli sebagai lampiran"],
                  },
                ].map((section) => (
                  <div key={section.page} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex-shrink-0 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg h-fit">
                      {section.page}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm mb-1">{section.title}</p>
                      <ul className="space-y-0.5">
                        {section.items.map((item) => (
                          <li key={item} className="text-xs text-slate-500 flex items-start gap-1.5">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-teal-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 7. Tips ──────────────────────────────────────────────────── */}
            <Section id="tips" title="Tips & Praktik Terbaik">
              <div className="space-y-4">
                {[
                  {
                    num: "01",
                    title: "Kualitas gambar surat undangan",
                    desc: "Pastikan seluruh teks terbaca jelas. Foto dengan pencahayaan baik dan tanpa blur menghasilkan ekstraksi yang lebih akurat. Jika menggunakan scan, gunakan resolusi minimal 150 DPI.",
                  },
                  {
                    num: "02",
                    title: "Manfaatkan transcript semaksimal mungkin",
                    desc: "Transcript yang lengkap adalah kunci narasi Hasil Pembahasan yang berkualitas. Anda bisa menempelkan transcript verbatim, ringkasan notulen, atau poin-poin rapat — Visa akan mengolahnya menjadi narasi formal.",
                  },
                  {
                    num: "03",
                    title: "Selalu cek halaman Review",
                    desc: "Meskipun Visa akurat, selalu verifikasi data yang diekstrak — terutama nomor surat, tanggal, dan nama pengirim. Edit langsung di form jika ada yang kurang tepat.",
                  },
                  {
                    num: "04",
                    title: "Gunakan Regenerasi Narasi jika perlu",
                    desc: "Setiap regenerasi menghasilkan narasi yang sedikit berbeda. Jika narasi pertama kurang sesuai gaya atau isi yang diinginkan, coba regenerasi 1–2 kali sambil memastikan transcript sudah lengkap.",
                  },
                  {
                    num: "05",
                    title: "Perhatikan Tempat Pelaksanaan",
                    desc: "Field 'Tempat Pelaksanaan Kegiatan' di halaman Review menentukan teks di baris tanda tangan (misal: Jakarta Selatan, 10 April 2026). Pastikan diisi nama kota/tempat, bukan alamat lengkap gedung.",
                  },
                  {
                    num: "06",
                    title: "Paste gambar langsung dari clipboard",
                    desc: "Fitur tempel (Ctrl+V) memudahkan upload screenshot. Ambil screenshot undangan, arahkan kursor ke area dropzone, tekan Ctrl+V — tidak perlu simpan file terlebih dahulu.",
                  },
                ].map((tip) => (
                  <div key={tip.num} className="flex gap-4">
                    <span className="flex-shrink-0 text-sm font-bold text-teal-300">{tip.num}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{tip.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 8. FAQ ───────────────────────────────────────────────────── */}
            <Section id="faq" title="Pertanyaan yang Sering Diajukan">
              <div className="space-y-5">
                {[
                  {
                    q: "Apakah data dan dokumen saya aman?",
                    a: "Ya. File dan data Anda tidak pernah disimpan di server secara permanen. Semua pemrosesan bersifat sementara dan stateless — setiap request diproses di memori dan langsung dihapus. Tidak ada database yang menyimpan konten dokumen Anda.",
                  },
                  {
                    q: "Mengapa Visa salah membaca surat undangan?",
                    a: "Akurasi ekstraksi bergantung pada kualitas gambar. Surat yang terpotong, blur, atau memiliki pencahayaan buruk dapat menyebabkan kesalahan. Solusi: upload gambar yang lebih jelas, atau edit manual hasilnya di halaman Review.",
                  },
                  {
                    q: "Berapa lama proses pembuatan laporan?",
                    a: "Ekstraksi data biasanya selesai dalam 10–20 detik. Pembuatan narasi 15–30 detik. Generate dokumen .docx beberapa detik. Total sekitar 30–60 detik.",
                  },
                  {
                    q: "Apakah bisa digunakan untuk jenis perjalanan dinas lain?",
                    a: "Ya, selama ada surat undangan resmi, foto kegiatan, dan daftar hadir, SPD Generator dapat digunakan untuk berbagai jenis kegiatan perjalanan dinas.",
                  },
                  {
                    q: "Transcript harus dalam format apa?",
                    a: "Transcript bisa berupa teks bebas — transcript verbatim, ringkasan notulen, poin-poin rapat, atau kombinasi ketiganya. Tidak ada format khusus. Copy-paste langsung ke kolom teks yang tersedia.",
                  },
                  {
                    q: "Apakah bisa diakses dari ponsel?",
                    a: "Ya, antarmuka responsif untuk perangkat mobile. Namun untuk pengalaman upload file dan review terbaik, disarankan menggunakan komputer atau laptop.",
                  },
                  {
                    q: "Apakah bisa mengubah template dokumen?",
                    a: "Template dokumen saat ini sudah disesuaikan dengan format standar Kementerian ESDM. Untuk permintaan penyesuaian template, silakan hubungi melalui kontak yang tersedia.",
                  },
                  {
                    q: "Apa yang dimaksud fitur tempel (Ctrl+V)?",
                    a: "Fitur paste memungkinkan Anda langsung menempelkan gambar dari clipboard ke dropzone. Contoh penggunaan: screenshot undangan dari email → Ctrl+C pada gambar → arahkan kursor ke area dropzone Surat Undangan → Ctrl+V. Tidak perlu menyimpan file terlebih dahulu.",
                  },
                ].map((item) => (
                  <div key={item.q} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <p className="font-semibold text-slate-800 text-sm mb-1.5">{item.q}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 9. Kontak ────────────────────────────────────────────────── */}
            <Section id="kontak" title="Kontak & Bantuan">
              <p>
                Jika mengalami kendala teknis, menemukan bug, atau memiliki pertanyaan
                yang tidak terjawab di dokumentasi ini, silakan hubungi:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <a
                  href="https://wa.me/6289693919042"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-green-100 bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.85L.057 23.177a.75.75 0 00.92.92l5.327-1.465A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.51-5.174-1.399l-.37-.216-3.838 1.056 1.056-3.838-.216-.37A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-800">WhatsApp</p>
                    <p className="text-sm font-semibold text-green-700 group-hover:underline">089693919042</p>
                    <p className="text-xs text-green-600 mt-0.5">Respon cepat</p>
                  </div>
                </a>

                <a
                  href="mailto:rafihadiyasa32@gmail.com"
                  className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800">Email</p>
                    <p className="text-sm font-semibold text-blue-700 group-hover:underline">rafihadiyasa32@gmail.com</p>
                    <p className="text-xs text-blue-600 mt-0.5">Untuk pertanyaan detail</p>
                  </div>
                </a>
              </div>
            </Section>

          </article>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-100 py-8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">SPD Generator · Kementerian ESDM</p>
          <Link
            href="/generate"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Mulai Buat Laporan →
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ── Doc components ────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-teal-500 to-blue-500" />
        {title}
      </h2>
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-teal-50 border border-teal-100 text-sm text-teal-800 leading-relaxed">
      <span className="flex-shrink-0 text-teal-500">ℹ</span>
      <div>{children}</div>
    </div>
  );
}

function StepBlock({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-12 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-5 top-10 bottom-0 w-px bg-teal-100 last:hidden" />
      {/* Circle */}
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm shadow-teal-200">
        <span className="text-white font-bold text-sm">{number}</span>
      </div>
      <div className="pt-1.5">
        <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
        <div className="space-y-2 text-sm text-slate-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function SubStep({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
      <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-2">{title}</p>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function TechStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
          Step {number}
        </span>
        <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      </div>
      <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 p-3 rounded-lg bg-slate-900 text-slate-100 text-xs overflow-x-auto leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function CapabilityCard({ icon, title, subtitle, desc }: { icon: string; title: string; subtitle: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-bold text-slate-800 text-sm">{title}</p>
      <p className="text-xs text-teal-600 font-medium mb-2">{subtitle}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function DocList({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">{i + 1}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
