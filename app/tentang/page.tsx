// app/tentang/page.tsx — Tentang SUARAKYAT, pemilik: A (isi dari PRD v0.3 bagian 1 dan 3)
// Konsep "lapis kedua", masalah yang dijawab, beda dengan kanal resmi, empat subtema WIA, nilai yang dibawa, dan tanya
// jawab. Setiap klaim di sini harus cocok dengan fitur yang benar-benar ada di aplikasi; fitur yang belum dibuat
// (misalnya data BPS yang masih "Menyusul") tidak disebut sebagai sudah ada.

import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import KepalaHalaman from '@/components/KepalaHalaman';
import Ikon, { type NamaIkon } from '@/components/ui/Ikon';
import { kelasTautan, kelasTombol } from '@/components/ui/Tombol';
import { KANAL_RESMI, NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR } from '@/lib/scoring';

export const metadata: Metadata = {
  title: 'Tentang',
  description:
    'Kenapa SUARAKYAT dibuat, apa bedanya dengan kanal pengaduan resmi, empat subtema yang dijawab, dan tanya jawab.',
};

const MASALAH = [
  {
    masalah: 'Warga tidak tahu laporannya diproses atau menumpuk.',
    jawaban: 'Kode laporan, riwayat status, dan sisa batas waktu yang bisa dilacak siapa saja.',
    href: '/contoh',
    aksi: 'Buka laporan contoh',
  },
  {
    masalah: 'Kinerja instansi jarang terlihat publik, jadi tekanan untuk transparan kecil.',
    jawaban: 'Rapor Instansi A sampai E yang terbuka, selalu bersama tingkat penolakannya.',
    href: '/rapor',
    aksi: 'Baca rapor instansi',
  },
  {
    masalah: 'Pengambil keputusan tidak punya dasar objektif untuk menentukan prioritas.',
    jawaban: 'Skor prioritas dengan rincian enam faktor, terbuka untuk publik dan bisa diuji dengan bobot lain.',
    href: '/prioritas',
    aksi: 'Uji bobot prioritas',
  },
];

// Kolom tengah: penelusuran tim per Oktober 2026 (PRD bagian 1). `baru` = belum ditemukan terbuka di kanal resmi.
const BEDA: { kemampuan: string; resmi: string; kita: string; baru: boolean }[] = [
  { kemampuan: 'Lapor dan lacak status', resmi: 'Sudah ada', kita: 'Ada, sebagai sumber data', baru: false },
  {
    kemampuan: 'Foto bukti dan rating pelapor',
    resmi: 'Sudah ada',
    kita: 'Ada, ditambah foto sebelum dan sesudah yang berdampingan',
    baru: false,
  },
  {
    kemampuan: 'Penilaian kinerja penanganan',
    resmi: 'Ada untuk internal pemerintah (Pergub DKI 128/2017)',
    kita: 'Rapor publik bersama tingkat penolakan, sampel, dan periode',
    baru: true,
  },
  {
    kemampuan: 'Alasan sebuah masalah didahulukan',
    resmi: 'Belum ditemukan terbuka untuk publik',
    kita: 'Skor dengan rincian faktor dan kalimat penjelasan',
    baru: true,
  },
  { kemampuan: 'Warga menguji bobot prioritas', resmi: 'Belum ditemukan', kita: 'Simulator bobot publik', baru: true },
  {
    kemampuan: 'Riwayat perubahan keputusan prioritas',
    resmi: 'Belum ditemukan terbuka untuk publik',
    kita: 'Riwayat perubahan bobot beserta alasannya',
    baru: true,
  },
];

const SUBTEMA: { nama: string; judul: string; ikon: NamaIkon; isi: string; href: string; aksi: string }[] = [
  {
    nama: 'Open Government Data',
    judul: 'Data pemerintah terbuka',
    ikon: 'data',
    isi: 'Batas 42 kecamatan dari data terbuka HDX (BPS) dan peta dasar OpenStreetMap. Halaman Sumber data mencantumkan lisensi setiap dataset dan memisahkan data nyata dari data simulasi.',
    href: '/sumber-data',
    aksi: 'Lihat sumber data',
  },
  {
    nama: 'Public Service Tracking',
    judul: 'Pelacakan layanan publik',
    ikon: 'lacak',
    isi: 'Setiap laporan punya kode SR, riwayat status yang tercatat lengkap dengan instansinya, dan penanda sisa batas waktu respons serta selesai.',
    href: '/lacak',
    aksi: 'Lacak laporan',
  },
  {
    nama: 'Civic Reporting & Accountability',
    judul: 'Pelaporan warga dan akuntabilitas',
    ikon: 'perisai',
    isi: 'Laporan berbasis titik di peta, jawaban dinas yang tercatat publik, laporan yang ditolak tetap tampil bersama alasannya, dan Rapor Instansi yang bisa dibaca siapa saja.',
    href: '/peta?status=ditolak',
    aksi: 'Lihat laporan yang ditolak',
  },
  {
    nama: 'Data-Driven Decision Support',
    judul: 'Pendukung keputusan berbasis data',
    ikon: 'geser',
    isi: 'Skor prioritas 0 sampai 100 dari enam faktor, simulator bobot untuk melihat urutan bergeser, dan perbandingan kinerja antarinstansi serta antarkecamatan.',
    href: '/prioritas',
    aksi: 'Buka dashboard prioritas',
  },
];

const NILAI: { nama: string; ikon: NamaIkon; isi: string; href: string; aksi: string }[] = [
  {
    nama: 'Edukasi',
    ikon: 'buku',
    isi: 'Warga belajar membaca keputusan publik: setiap skor punya rincian, setiap huruf rapor punya rumus, dan simulator menunjukkan bahwa bobot adalah pilihan, bukan kebenaran.',
    href: '/rapor/cara-menilai',
    aksi: 'Pelajari cara menilai',
  },
  {
    nama: 'Budaya',
    ikon: 'warga',
    isi: 'Budaya keterbukaan dan saling dukung: warga sekitar bisa mendukung laporan yang sama, penolakan tidak disembunyikan, dan foto arsip Jakarta sejak masa Batavia mengingatkan bahwa masalah kota sudah lama ada.',
    href: '/peta',
    aksi: 'Jelajahi peta laporan',
  },
  {
    nama: 'Teknologi',
    ikon: 'grafik',
    isi: 'Skor dihitung langsung di browser dengan rumus yang sama di semua halaman, peta interaktif dari data geospasial terbuka, dan foto dikecilkan di perangkat serta dibuang data lokasinya sebelum diunggah.',
    href: '/prioritas',
    aksi: 'Coba simulator bobot',
  },
];

const daftarFaktor = FAKTOR.map((f) => NAMA_FAKTOR[f].toLowerCase()).join(', ');

const TANYA: { tanya: string; jawab: ReactNode }[] = [
  {
    tanya: 'Apakah laporan di SUARAKYAT diteruskan ke instansi?',
    jawab: (
      <>
        Tidak. SUARAKYAT adalah prototipe untuk lomba, bukan kanal pengaduan resmi. Untuk pengaduan resmi ke Pemprov DKI
        Jakarta, gunakan{' '}
        {KANAL_RESMI.map((k, i) => (
          <span key={k.nama}>
            {i > 0 && ' atau '}
            <a href={k.url} target="_blank" rel="noreferrer" className={kelasTautan}>
              {k.nama}
              <span className="sr-only"> (tab baru)</span>
            </a>
          </span>
        ))}
        .
      </>
    ),
  },
  {
    tanya: 'Apakah angka di situs ini data sungguhan?',
    jawab: (
      <>
        Batas wilayah dan peta dasar memakai data terbuka. Laporan, instansi, dan angka kinerja adalah data simulasi yang
        dibuat generator dengan random seed tetap, dan setiap halaman memberi labelnya. Rinciannya ada di{' '}
        <Link href="/sumber-data" className={kelasTautan}>
          Sumber data
        </Link>
        .
      </>
    ),
  },
  {
    tanya: 'Bagaimana skor prioritas dihitung?',
    jawab: (
      <>
        Skor = 100 × jumlah (bobot × nilai faktor) dari enam faktor: {daftarFaktor}. Nilai setiap faktor diubah ke skala 0
        sampai 1, jadi kontribusi semua faktor selalu berjumlah sama dengan skornya. Isu tanpa laporan aktif tidak diberi
        peringkat.{' '}
        <Link href="/prioritas" className={kelasTautan}>
          Lihat rinciannya
        </Link>
        .
      </>
    ),
  },
  {
    tanya: 'Siapa yang menentukan bobot, dan bisakah saya mengubahnya?',
    jawab: (
      <>
        Bobot resmi diatur Perencana, dan setiap perubahan wajib beralasan serta tercatat di{' '}
        <Link href="/prioritas#judul-riwayat" className={kelasTautan}>
          riwayat keputusan
        </Link>
        . Siapa saja bisa menggeser bobot di simulator untuk melihat urutannya bergeser, tanpa mengubah bobot resmi.
      </>
    ),
  },
  {
    tanya: 'Kenapa huruf rapor sebuah instansi bisa ditahan?',
    jawab: (
      <>
        Kalau tingkat penolakan sebuah instansi di atas 25%, atau lebih dari dua kali median instansi lain, hurufnya ditahan
        paling tinggi C walau angkanya setara A. Dengan begitu nilai bagus hasil membuang laporan langsung terlihat.{' '}
        <Link href="/rapor/cara-menilai" className={kelasTautan}>
          Baca cara menilai
        </Link>
        .
      </>
    ),
  },
  {
    tanya: 'Bagaimana mencoba semua alur tanpa mendaftar?',
    jawab: (
      <>
        Pakai tombol akun demo di halaman{' '}
        <Link href="/masuk" className={kelasTautan}>
          Masuk
        </Link>
        . Warga demo bisa melapor dan mendukung laporan; admin demo mengubah status laporan Dinas Bina Jalan (simulasi). Data
        demo dikembalikan ke awal setiap malam.
      </>
    ),
  },
];

export default function TentangPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Tentang SUARAKYAT">
        Kanal pengaduan sudah melacak laporan. SUARAKYAT membuka alasan di balik keputusan: kenapa satu masalah kota
        didahulukan, dan siapa saja bisa mengujinya.
      </KepalaHalaman>

      <nav aria-label="Isi halaman" className="mt-5 flex flex-wrap gap-2">
        <a href="#beda" className="chip">Beda dengan kanal resmi</a>
        <a href="#subtema" className="chip">Empat subtema</a>
        <a href="#nilai" className="chip">Nilai yang dibawa</a>
        <a href="#tanya-jawab" className="chip">Tanya jawab</a>
      </nav>

      <section aria-labelledby="judul-lapis" className="mt-10">
        <h2 id="judul-lapis" className="judul-seksi">
          Dua lapis transparansi
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-2" data-muncul>
          <li className="kartu p-5 sm:p-6">
            <p className="text-kecil font-semibold text-lembut">Lapis pertama · sudah ada</p>
            <p className="mt-2 text-sub font-bold">&ldquo;Laporanku sampai mana?&rdquo;</p>
            <p className="mt-2 text-badan text-lembut">
              Status dan pelacakan laporan sudah dikerjakan kanal resmi seperti CRM Jakarta dan LAPOR!.
            </p>
          </li>
          <li className="di-gelap rounded-kartu bg-biru p-5 text-white sm:p-6">
            <p className="text-kecil font-semibold">Lapis kedua · dibuka SUARAKYAT</p>
            <p className="mt-2 text-sub font-bold">&ldquo;Kenapa laporanku belum, padahal yang lain sudah?&rdquo;</p>
            <p className="mt-2 text-badan">
              Alasan di balik urutan penanganan: faktor yang mendorong dan menahan, siapa yang menangani dan seberapa baik,
              serta riwayat setiap perubahan keputusan.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="judul-masalah" className="mt-12">
        <h2 id="judul-masalah" className="judul-seksi">
          Tiga masalah yang dijawab
        </h2>
        <p className="mt-2 max-w-[75ch] text-badan text-lembut">
          Warga sudah bisa melapor, tetapi belum bisa melihat apakah laporannya ditangani, siapa yang lambat, dan kenapa satu
          masalah didahulukan dari yang lain.
        </p>
        <ul className="kartu mt-5 divide-y divide-garis" data-muncul>
          {MASALAH.map((m) => (
            <li
              key={m.href}
              className="grid gap-3 p-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-8"
            >
              <p className="text-badan font-semibold">{m.masalah}</p>
              <p className="flex gap-2 text-badan text-lembut">
                <Ikon nama="centang" className="mt-1 size-4 text-hijau" />
                {m.jawaban}
              </p>
              <Link href={m.href} className="inline-flex items-center gap-1 text-kecil font-bold whitespace-nowrap text-biru-tua hover:underline">
                {m.aksi}
                <Ikon nama="kanan" className="panah size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="beda" aria-labelledby="judul-beda" className="mt-12 scroll-mt-24">
        <h2 id="judul-beda" className="judul-seksi">
          Apa yang baru dibanding kanal resmi
        </h2>
        <p className="mt-2 max-w-[75ch] text-badan text-lembut">
          Fitur dasar pengaduan sudah dimiliki kanal resmi, jadi tidak dijual sebagai inovasi. Pembedanya ada di tiga hal yang
          belum terbuka untuk publik: alasan prioritas yang bisa diuji, rapor yang jujur soal penolakan, dan riwayat keputusan.
        </p>
        <ul className="mt-5 grid gap-3 sm:hidden">
          {BEDA.map((b) => (
            <li key={b.kemampuan} className="kartu grid gap-3 p-4">
              <p className="flex items-start justify-between gap-3 font-bold">
                {b.kemampuan}
                {b.baru && <span className="rounded-[0.375rem] bg-biru px-2 py-0.5 text-mini font-bold text-white">Baru</span>}
              </p>
              <dl className="grid gap-2 text-kecil">
                <div>
                  <dt className="text-lembut">Kanal resmi</dt>
                  <dd>{b.resmi}</dd>
                </div>
                <div>
                  <dt className="text-lembut">SUARAKYAT</dt>
                  <dd className="font-semibold text-biru-tua">{b.kita}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="kartu relative mt-5 hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[40rem] text-left text-badan">
            <caption className="sr-only">Kemampuan kanal resmi dibanding SUARAKYAT</caption>
            <thead className="bg-latar text-kecil text-lembut">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Kemampuan</th>
                <th scope="col" className="px-4 py-3 font-semibold">Kanal resmi (CRM Jakarta, LAPOR!)</th>
                <th scope="col" className="px-4 py-3 font-semibold">SUARAKYAT</th>
              </tr>
            </thead>
            <tbody>
              {BEDA.map((b) => (
                <tr key={b.kemampuan} className={`border-t border-garis transition-colors hover:bg-biru-pudar ${b.baru ? '' : 'text-lembut'}`}>
                  <th scope="row" className="p-4 font-bold text-teks">{b.kemampuan}</th>
                  <td className="p-4 text-kecil">{b.resmi}</td>
                  <td className="p-4 text-kecil">
                    <span className={b.baru ? 'font-semibold text-biru-tua' : ''}>{b.kita}</span>
                    {b.baru && <span className="ml-2 rounded-[0.375rem] bg-biru px-2 py-0.5 text-mini font-bold whitespace-nowrap text-white">Baru</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-[80ch] text-kecil text-lembut">
          Kolom kanal resmi berdasarkan penelusuran tim per Oktober 2026: paparan pengelolaan aduan warga Jakarta, Pergub DKI
          Jakarta Nomor 128 Tahun 2017, dan artikel Hukumonline tentang CRM.
        </p>
      </section>

      <section id="subtema" aria-labelledby="judul-subtema" className="mt-12 scroll-mt-24">
        <h2 id="judul-subtema" className="judul-seksi">
          Empat subtema dalam satu alur
        </h2>
        <p className="mt-2 max-w-[75ch] text-badan text-lembut">
          SUARAKYAT dibuat untuk lomba Web in Action (WIA) MIA 2026. Keempat subtemanya saling menyambung: data terbuka menjadi
          dasar, laporan warga menjadi bahan, pelacakan menjaga janji layanan, dan skor prioritas menjadi keputusan yang bisa
          diuji.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2" data-muncul>
          {SUBTEMA.map((s) => (
            <li key={s.nama} className="kartu flex flex-col p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
                  <Ikon nama={s.ikon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <p lang="en" className="text-mini font-semibold text-lembut">
                    {s.nama}
                  </p>
                  <h3 className="text-lead leading-tight font-bold">{s.judul}</h3>
                </div>
              </div>
              <p className="mt-3 flex-1 text-kecil text-lembut">{s.isi}</p>
              <Link href={s.href} className="mt-4 inline-flex items-center gap-1 self-start text-kecil font-bold text-biru-tua hover:underline">
                {s.aksi}
                <Ikon nama="kanan" className="panah size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="nilai" aria-labelledby="judul-nilai" className="mt-12 scroll-mt-24">
        <h2 id="judul-nilai" className="judul-seksi">
          Nilai yang dibawa
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-3" data-muncul>
          {NILAI.map((n) => (
            <li key={n.nama} className="kartu flex flex-col p-5">
              <h3 className="flex items-center gap-2 text-lead font-bold">
                <Ikon nama={n.ikon} className="size-5 text-biru" />
                {n.nama}
              </h3>
              <p className="mt-2 flex-1 text-kecil text-lembut">{n.isi}</p>
              <Link href={n.href} className="mt-4 inline-flex items-center gap-1 self-start text-kecil font-bold text-biru-tua hover:underline">
                {n.aksi}
                <Ikon nama="kanan" className="panah size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="tanya-jawab" aria-labelledby="judul-tanya" className="mt-12 scroll-mt-24">
        <h2 id="judul-tanya" className="judul-seksi">
          Tanya jawab
        </h2>
        <div className="kartu mt-5 divide-y divide-garis">
          {TANYA.map((t) => (
            <details key={t.tanya} className="group">
              <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-5 py-4 text-badan font-bold transition-colors hover:text-biru-tua sm:px-6 [&::-webkit-details-marker]:hidden">
                {t.tanya}
                <Ikon nama="turun" className="size-5 text-lembut transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="turun-panel max-w-[75ch] px-5 pb-5 text-badan text-lembut sm:px-6">{t.jawab}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="judul-coba"
        className="di-gelap mt-12 rounded-besar bg-[linear-gradient(135deg,#0f766e_0%,#115e59_55%,#134e4a_100%)] p-6 text-white sm:p-10"
      >
        <h2 id="judul-coba" className="judul-seksi">
          Mulai dari pertanyaan &ldquo;Kenapa belum?&rdquo;
        </h2>
        <p className="mt-2 max-w-[62ch] text-badan">
          Alur yang disarankan: uji bobot prioritas, buka satu laporan lalu tekan &ldquo;Kenapa belum?&rdquo;, kemudian lihat
          siapa yang menangani dan seberapa baik di Rapor Instansi.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/prioritas" className={kelasTombol('terang')}>
            <Ikon nama="geser" className="size-4" />
            Uji bobot prioritas
          </Link>
          <Link href="/contoh" className={kelasTombol('terang-garis')}>
            Buka laporan contoh
          </Link>
          <Link href="/rapor" className={kelasTombol('terang-garis')}>
            Baca rapor instansi
          </Link>
        </div>
      </section>
    </div>
  );
}
