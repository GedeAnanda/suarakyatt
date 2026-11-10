// app/tentang/page.tsx — Tentang SUARAKYAT, pemilik: A (isi dari PRD v0.3 bagian 1 dan 3)
// Dibuka dengan ringkasan 3 poin dalam bahasa sehari-hari, lalu dua pertanyaan warga, masalah yang dijawab, beda dengan
// aplikasi pengaduan resmi, nilai yang dibawa, dan tanya jawab. Subtema lomba ada di <details> "Untuk juri dan
// pengembang" di akhir. Setiap klaim di sini harus cocok dengan fitur yang benar-benar ada di aplikasi; fitur yang belum
// dibuat (misalnya data BPS yang masih "Menyusul") tidak disebut sebagai sudah ada.

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
    'Kenapa SUARAKYAT dibuat, apa bedanya dengan aplikasi pengaduan resmi seperti JAKI dan LAPOR!, dan tanya jawab.',
};

const RINGKAS: { judul: string; ikon: NamaIkon; isi: string }[] = [
  {
    judul: 'Apa ini',
    ikon: 'info',
    isi: 'Situs untuk melaporkan masalah kota Jakarta, melacaknya, dan melihat kenapa satu masalah ditangani lebih dulu dari yang lain.',
  },
  {
    judul: 'Apa bedanya',
    ikon: 'mata',
    isi: 'Aplikasi pengaduan resmi (JAKI, LAPOR!) sudah bisa melacak laporan. SUARAKYAT menambahkan alasan di balik urutan perbaikan dan rapor tiap dinas.',
  },
  {
    judul: 'Yang perlu kamu tahu',
    ikon: 'peringatan',
    isi: 'Ini proyek lomba. Laporan di sini tidak dikirim ke pemerintah. Laporan, dinas, dan rapornya data buatan.',
  },
];

const MASALAH = [
  {
    masalah: 'Warga tidak tahu laporannya sedang dikerjakan atau hanya menumpuk.',
    jawaban: 'Kode laporan, riwayat status, dan sisa waktu sebelum batas waktu, yang bisa dilacak siapa saja.',
    href: '/contoh',
    aksi: 'Buka laporan contoh',
  },
  {
    masalah: 'Kinerja dinas jarang terlihat oleh warga, jadi dorongan untuk terbuka kecil.',
    jawaban: 'Rapor dinas A sampai E yang terbuka, selalu bersama persen laporan yang ditolak.',
    href: '/rapor',
    aksi: 'Baca rapor dinas',
  },
  {
    masalah: 'Warga tidak bisa melihat dasar yang dipakai pemerintah untuk menentukan prioritas.',
    jawaban: 'Skor prioritas dengan rincian 6 hal yang dinilai, terbuka untuk semua orang. Kamu bisa mencoba aturan lain sendiri.',
    href: '/prioritas',
    aksi: 'Atur urutan sendiri',
  },
];

// Kolom tengah: penelusuran tim per Oktober 2026 (PRD bagian 1). `baru` = belum ditemukan terbuka di aplikasi resmi.
const BEDA: { kemampuan: string; resmi: string; kita: string; baru: boolean }[] = [
  { kemampuan: 'Lapor dan lacak status', resmi: 'Sudah ada', kita: 'Ada, sebagai bahan hitungan urutan', baru: false },
  {
    kemampuan: 'Foto bukti dan nilai bintang dari pelapor',
    resmi: 'Sudah ada',
    kita: 'Ada, ditambah foto sebelum dan sesudah yang berdampingan',
    baru: false,
  },
  {
    kemampuan: 'Penilaian kinerja dinas',
    resmi: 'Ada, tetapi hanya untuk internal pemerintah (Pergub DKI 128/2017)',
    kita: 'Rapor terbuka, bersama persen laporan yang ditolak, jumlah laporan yang dinilai, dan rentang waktunya',
    baru: true,
  },
  {
    kemampuan: 'Alasan sebuah masalah didahulukan',
    resmi: 'Belum kami temukan terbuka untuk warga',
    kita: 'Skor dengan rincian 6 hal yang dinilai, ditambah kalimat penjelasan',
    baru: true,
  },
  {
    kemampuan: 'Warga mencoba aturan urutan sendiri',
    resmi: 'Belum kami temukan',
    kita: 'Kamu bisa memilih sendiri apa yang diutamakan',
    baru: true,
  },
  {
    kemampuan: 'Riwayat perubahan aturan urutan',
    resmi: 'Belum kami temukan terbuka untuk warga',
    kita: 'Setiap perubahan tercatat bersama alasannya',
    baru: true,
  },
];

const SUBTEMA: { nama: string; judul: string; ikon: NamaIkon; isi: string; href: string; aksi: string }[] = [
  {
    nama: 'Open Government Data',
    judul: 'Data pemerintah terbuka',
    ikon: 'data',
    isi: 'Batas 42 kecamatan dari data terbuka HDX (BPS) dan peta dasar OpenStreetMap. Halaman Sumber data mencantumkan lisensi setiap data dan memisahkan data asli dari data buatan.',
    href: '/sumber-data',
    aksi: 'Lihat sumber data',
  },
  {
    nama: 'Public Service Tracking',
    judul: 'Pelacakan layanan publik',
    ikon: 'lacak',
    isi: 'Setiap laporan punya kode (SR-…), riwayat status yang tercatat bersama dinasnya, dan penanda sisa waktu sebelum batas waktu ditanggapi dan selesai.',
    href: '/lacak',
    aksi: 'Lacak laporan',
  },
  {
    nama: 'Civic Reporting & Accountability',
    judul: 'Pelaporan warga dan akuntabilitas',
    ikon: 'perisai',
    isi: 'Laporan dengan titik di peta, jawaban dinas yang tercatat terbuka, laporan yang ditolak tetap tampil bersama alasannya, dan rapor dinas yang bisa dibaca siapa saja.',
    href: '/peta?status=ditolak',
    aksi: 'Lihat laporan yang ditolak',
  },
  {
    nama: 'Data-Driven Decision Support',
    judul: 'Pendukung keputusan berbasis data',
    ikon: 'geser',
    isi: 'Skor prioritas 0 sampai 100 dari 6 hal yang dinilai, pilihan aturan untuk melihat urutan berubah, dan perbandingan kinerja antardinas serta antarkecamatan.',
    href: '/prioritas',
    aksi: 'Buka urutan prioritas',
  },
];

const NILAI: { nama: string; ikon: NamaIkon; isi: string; href: string; aksi: string }[] = [
  {
    nama: 'Edukasi',
    ikon: 'buku',
    isi: 'Warga belajar membaca keputusan publik. Setiap skor punya rincian, setiap nilai rapor punya cara hitung, dan kamu bisa melihat sendiri bahwa urutan tergantung apa yang diutamakan.',
    href: '/rapor/cara-menilai',
    aksi: 'Pelajari cara rapor dihitung',
  },
  {
    nama: 'Budaya',
    ikon: 'warga',
    isi: 'Budaya terbuka dan saling dukung. Warga sekitar bisa mendukung laporan yang sama, laporan yang ditolak tidak disembunyikan, dan foto lama Jakarta sejak masa Batavia mengingatkan bahwa masalah kota sudah lama ada.',
    href: '/peta',
    aksi: 'Jelajahi peta laporan',
  },
  {
    nama: 'Teknologi',
    ikon: 'grafik',
    isi: 'Skor dihitung langsung di perangkatmu dengan cara yang sama di semua halaman. Peta memakai data wilayah terbuka. Foto dikecilkan dan data lokasinya dibuang sebelum diunggah.',
    href: '/prioritas',
    aksi: 'Atur urutan sendiri',
  },
];

const daftarFaktor = FAKTOR.map((f) => NAMA_FAKTOR[f].toLowerCase()).join(', ');

const TANYA: { tanya: string; jawab: ReactNode }[] = [
  {
    tanya: 'Apakah laporan di SUARAKYAT dikirim ke dinas?',
    jawab: (
      <>
        Tidak. SUARAKYAT adalah proyek lomba, bukan aplikasi pengaduan resmi. Agar ditangani Pemprov DKI Jakarta, lapor
        lewat{' '}
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
        Yang asli: batas kecamatan dan peta. Yang buatan: laporan, dinas, rapor, dan untuk sementara angka penduduk serta
        kemiskinan. Skor prioritas dihitung dari keduanya, jadi ikut berstatus buatan. Data buatan dibuat program komputer
        dengan aturan tetap, jadi hasilnya selalu sama tiap diulang. Setiap halaman memberi label &ldquo;Data
        buatan&rdquo;. Rinciannya ada di{' '}
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
        Setiap masalah dinilai dari 6 hal: {daftarFaktor}. Tiap hal menyumbang poin sesuai seberapa penting hal itu, lalu
        poinnya dijumlahkan menjadi skor 0 sampai 100. Makin tinggi skornya, makin didahulukan. Masalah yang semua
        laporannya sudah selesai tidak masuk urutan.{' '}
        <Link href="/prioritas#cara-hitung" className={kelasTautan}>
          Bagaimana urutan ini dihitung?
        </Link>
      </>
    ),
  },
  {
    tanya: 'Siapa yang menentukan aturan urutannya, dan bisakah aku mengubahnya?',
    jawab: (
      <>
        Aturan resmi diatur petugas perencana kota. Setiap perubahan wajib diberi alasan dan tercatat di{' '}
        <Link href="/prioritas#judul-riwayat" className={kelasTautan}>
          riwayat perubahan
        </Link>
        . Kamu bisa mencoba aturan lain di halaman Urutan prioritas untuk melihat urutannya berubah, tanpa mengubah aturan
        resmi.
      </>
    ),
  },
  {
    tanya: 'Kenapa nilai rapor sebuah dinas bisa ditahan?',
    jawab: (
      <>
        Kalau dinas menolak lebih dari 25% laporan, atau menolak dua kali lebih banyak dari dinas lain pada umumnya,
        nilainya paling tinggi C, walau angkanya setara A. Jadi dinas yang banyak menolak laporan tidak bisa dapat nilai
        bagus.{' '}
        <Link href="/rapor/cara-menilai" className={kelasTautan}>
          Baca cara rapor dihitung
        </Link>
        .
      </>
    ),
  },
  {
    tanya: 'Bagaimana mencoba semua fitur tanpa mendaftar?',
    jawab: (
      <>
        Pakai tombol akun demo di halaman{' '}
        <Link href="/masuk" className={kelasTautan}>
          Masuk
        </Link>
        . Sebagai warga, kamu bisa melapor dan mendukung laporan. Sebagai petugas dinas contoh, kamu bisa mengubah status
        laporan Dinas Bina Jalan. Semua isian dihapus tiap malam.
      </>
    ),
  },
];

export default function TentangPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Tentang SUARAKYAT">
        Aplikasi pengaduan resmi sudah bisa melacak laporan. SUARAKYAT menunjukkan alasan di balik keputusan: kenapa satu
        masalah kota didahulukan. Kamu bisa mengujinya sendiri.
      </KepalaHalaman>

      {/* Ringkasan 3 poin dalam bahasa sehari-hari: cukup dibaca ini saja. */}
      <section aria-labelledby="judul-ringkas" className="mt-6">
        <h2 id="judul-ringkas" className="sr-only">
          Ringkasan
        </h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {RINGKAS.map((r) => (
            <li key={r.judul} className="kartu flex gap-3 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
                <Ikon nama={r.ikon} className="size-5" />
              </span>
              <div>
                <h3 className="text-lead font-bold">{r.judul}</h3>
                <p className="mt-1 text-badan text-lembut">{r.isi}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Isi halaman" className="mt-6 flex flex-wrap gap-2">
        <a href="#beda" className="chip">Beda dengan aplikasi resmi</a>
        <a href="#nilai" className="chip">Nilai yang dibawa</a>
        <a href="#tanya-jawab" className="chip">Tanya jawab</a>
        <a href="#juri" className="chip">Untuk juri dan pengembang</a>
      </nav>

      <section aria-labelledby="judul-lapis" className="mt-10">
        <h2 id="judul-lapis" className="judul-seksi">
          Dua pertanyaan warga
        </h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-2" data-muncul>
          <li className="kartu p-5 sm:p-6">
            <p className="text-kecil font-semibold text-lembut">Pertanyaan pertama · sudah dijawab aplikasi resmi</p>
            <p className="mt-2 text-sub font-bold">&ldquo;Laporanku sampai mana?&rdquo;</p>
            <p className="mt-2 text-badan text-lembut">
              Status dan pelacakan laporan sudah ada di aplikasi pengaduan resmi seperti JAKI dan LAPOR!.
            </p>
          </li>
          <li className="di-gelap rounded-kartu bg-biru p-5 text-white sm:p-6">
            <p className="text-kecil font-semibold">Pertanyaan kedua · dijawab SUARAKYAT</p>
            <p className="mt-2 text-sub font-bold">&ldquo;Kenapa laporanku belum, padahal yang lain sudah?&rdquo;</p>
            <p className="mt-2 text-badan">
              Alasan di balik urutan perbaikan: apa yang paling menaikkan dan paling menahan, dinas mana yang menangani dan
              seberapa baik, serta riwayat setiap perubahan aturan.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="judul-masalah" className="mt-12">
        <h2 id="judul-masalah" className="judul-seksi">
          Tiga masalah yang dijawab
        </h2>
        <p className="mt-2 max-w-[75ch] text-badan text-lembut">
          Warga sudah bisa melapor. Tetapi warga belum bisa melihat apakah laporannya ditangani, dinas mana yang lambat, dan
          kenapa satu masalah didahulukan dari yang lain.
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
              <Link href={m.href} className="inline-flex min-h-11 items-center gap-1 text-kecil font-bold whitespace-nowrap text-biru-tua hover:underline">
                {m.aksi}
                <Ikon nama="kanan" className="panah size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="beda" aria-labelledby="judul-beda" className="mt-12 scroll-mt-24">
        <h2 id="judul-beda" className="judul-seksi">
          Apa yang baru dibanding aplikasi pengaduan resmi
        </h2>
        <p className="mt-2 max-w-[75ch] text-badan text-lembut">
          Fitur dasar pengaduan sudah ada di aplikasi resmi, jadi kami tidak menyebutnya hal baru. Yang baru ada di tiga hal
          yang belum terbuka untuk warga: alasan urutan yang bisa dicek, rapor yang jujur soal penolakan, dan riwayat
          perubahan aturan.
        </p>
        <ul className="mt-5 grid gap-3 sm:hidden">
          {BEDA.map((b) => (
            <li key={b.kemampuan} className="kartu grid gap-3 p-4">
              <p className="flex items-start justify-between gap-3 font-bold">
                {b.kemampuan}
                {b.baru && <span className="rounded-[0.375rem] bg-biru px-2 py-0.5 text-kecil font-bold text-white">Baru</span>}
              </p>
              <dl className="grid gap-2 text-kecil">
                <div>
                  <dt className="text-lembut">Aplikasi resmi</dt>
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
            <caption className="sr-only">Yang bisa dilakukan di aplikasi pengaduan resmi dibanding SUARAKYAT</caption>
            <thead className="bg-latar text-kecil text-lembut">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Yang bisa dilakukan</th>
                <th scope="col" className="px-4 py-3 font-semibold">Aplikasi pengaduan resmi (JAKI, LAPOR!)</th>
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
          Isi kolom aplikasi resmi berdasarkan penelusuran tim per Oktober 2026: paparan pengelolaan aduan warga Jakarta,
          Pergub DKI Jakarta Nomor 128 Tahun 2017, dan artikel Hukumonline tentang sistem pengelolaan aduan Pemprov DKI.
        </p>
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
              <Link href={n.href} className="mt-4 inline-flex min-h-11 items-center gap-1 self-start text-kecil font-bold text-biru-tua hover:underline">
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
          Coba urutan ini: atur sendiri apa yang diutamakan, buka satu laporan lalu tekan &ldquo;Kenapa belum?&rdquo;,
          kemudian lihat dinas mana yang menangani dan seberapa baik di Rapor dinas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/prioritas" className={kelasTombol('terang', 'min-h-11')}>
            <Ikon nama="geser" className="size-4" />
            Atur urutan sendiri
          </Link>
          <Link href="/contoh" className={kelasTombol('terang-garis', 'min-h-11')}>
            Buka laporan contoh
          </Link>
          <Link href="/rapor" className={kelasTombol('terang-garis', 'min-h-11')}>
            Baca rapor dinas
          </Link>
        </div>
      </section>

      {/* Subtema lomba dan detail teknis: untuk juri, bukan untuk warga. Tertutup sampai dibuka. */}
      <details id="juri" className="kartu group mt-12 scroll-mt-24">
        <summary className="flex min-h-14 list-none items-center justify-between gap-4 px-5 py-4 text-lead font-bold transition-colors hover:text-biru-tua sm:px-6 [&::-webkit-details-marker]:hidden">
          Untuk juri dan pengembang
          <Ikon nama="turun" className="size-5 text-lembut transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="turun-panel px-5 pb-6 sm:px-6">
          <h2 id="judul-subtema" className="text-sub font-bold">
            Empat subtema dalam satu alur
          </h2>
          <p className="mt-2 max-w-[75ch] text-badan text-lembut">
            SUARAKYAT dibuat untuk lomba Web in Action (WIA) MIA 2026. Keempat subtemanya saling menyambung: data terbuka
            menjadi dasar, laporan warga menjadi bahan, pelacakan menjaga janji layanan, dan skor prioritas menjadi keputusan
            yang bisa diuji.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {SUBTEMA.map((s) => (
              <li key={s.nama} className="flex flex-col rounded-kartu border border-garis p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
                    <Ikon nama={s.ikon} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p lang="en" className="text-kecil font-semibold text-lembut">
                      {s.nama}
                    </p>
                    <h3 className="text-lead leading-tight font-bold">{s.judul}</h3>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-kecil text-lembut">{s.isi}</p>
                <Link href={s.href} className="mt-4 inline-flex min-h-11 items-center gap-1 self-start text-kecil font-bold text-biru-tua hover:underline">
                  {s.aksi}
                  <Ikon nama="kanan" className="panah size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
