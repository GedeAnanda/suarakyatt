// components/beranda/KuponPeran.tsx — untuk siapa SUARAKYAT, sebagai deret kupon (pemilik: A)
// Kartu pertama adalah ajakan mencoba akun demo (seperti kartu "masuk dan ambil kupon" di situs travel);
// sisanya satu kupon per peran: warga, petugas perencana kota, pengawas, dan pengingat bahwa ini bukan aplikasi
// pengaduan resmi. Bagian ini paling akhir di Beranda.

import Link from 'next/link';
import { KANAL_RESMI } from '@/lib/konten';
import TombolDemo from '../TombolDemo';
import BarisGeser from '../ui/BarisGeser';
import Ikon, { type NamaIkon } from '../ui/Ikon';

const JAKI = KANAL_RESMI.find((k) => k.nama === 'JAKI') ?? KANAL_RESMI[0];

const PERAN: { judul: string; ikon: NamaIkon; isi: string; href: string; aksi: string; luar?: boolean }[] = [
  {
    judul: 'Warga',
    ikon: 'warga',
    isi: 'Lihat urutan masalah di kecamatanmu di antara semua masalah, apa yang paling menaikkan dan paling menahannya, lalu lacak laporanmu dengan kodenya.',
    href: '/prioritas',
    aksi: 'Lihat urutan prioritas',
  },
  {
    judul: 'Petugas perencana kota',
    ikon: 'geser',
    isi: 'Petugas perencana kota mengatur seberapa penting tiap hal yang dinilai. Setiap perubahan wajib diberi alasan dan tercatat terbuka: siapa, kapan, dan dari berapa ke berapa.',
    href: '/prioritas#judul-riwayat',
    aksi: 'Buka riwayat perubahan',
  },
  {
    judul: 'Pengawas',
    ikon: 'mata',
    isi: 'Jurnalis, DPRD, dan komunitas membaca rapor dinas A sampai E. Di sampingnya selalu ada persen laporan yang ditolak, jumlah laporan yang dinilai, dan rentang waktunya.',
    href: '/rapor',
    aksi: 'Baca rapor dinas',
  },
  {
    judul: 'Bukan aplikasi pengaduan resmi',
    ikon: 'info',
    isi: 'Laporan di sini tidak dikirim ke dinas. Agar ditangani pemerintah, lapor lewat aplikasi pengaduan resmi (JAKI, LAPOR!). Wilayah SUARAKYAT: Jakarta daratan, 5 kota, 42 kecamatan.',
    href: JAKI.url,
    aksi: 'Lapor resmi lewat JAKI',
    luar: true,
  },
];

const kelasAksi = 'm-4 inline-flex min-h-11 items-center gap-1 self-start text-kecil font-bold text-biru-tua hover:underline';

export default function KuponPeran() {
  return (
    <section aria-labelledby="judul-peran" className="bingkai mt-12 sm:mt-14">
      <h2 id="judul-peran" className="judul-seksi">
        Yang selama ini tidak bisa dilihat warga
      </h2>
      <p className="mt-2 max-w-[78ch] text-badan text-lembut">
        Warga Jakarta sudah bisa melapor dan melacak laporannya di aplikasi pengaduan resmi (JAKI, LAPOR!). Yang belum
        bisa dilihat: kenapa satu jalan diperbaiki lebih dulu, dinas mana yang lambat, dan apa yang berubah kalau yang
        diutamakan diganti.{' '}
        <Link href="/tentang#beda" className="font-semibold text-biru-tua hover:underline">
          Lihat bedanya dengan aplikasi resmi
        </Link>
      </p>

      {/* Tanpa kelas `muncul`: di laptop 900 px deret ini bisa mengintip di layar, jadi akan terlihat pudar sebelum
          digulir (termasuk di tangkapan layar Beranda). */}
      <BarisGeser label="Untuk siapa SUARAKYAT" className="mt-5">
        {/* Lebar dibatasi persen deret supaya di ponsel 320 px kartu tidak lebih lebar dari layar. */}
        <li className="w-[min(20rem,88%)] shrink-0 snap-start sm:w-[22rem]">
          <div className="di-gelap flex h-full flex-col rounded-kartu bg-[linear-gradient(135deg,#0f766e_0%,#115e59_55%,#134e4a_100%)] p-5 text-white">
            <p className="flex items-center gap-2 text-lead font-bold">
              <Ikon nama="kunci" className="size-5" />
              Coba dulu tanpa daftar
            </p>
            <p className="mt-2 text-kecil text-white/90">
              Akun contoh untuk juri dan pengunjung. Sebagai warga, kamu bisa melapor dan mendukung laporan. Sebagai
              petugas dinas contoh, kamu bisa mengubah status laporan Dinas Bina Jalan. Semua isian dihapus tiap malam.
            </p>
            <TombolDemo className="mt-auto pt-5" varianWarga="terang" varianAdmin="terang-garis" />
          </div>
        </li>
        {PERAN.map((p) => (
          <li key={p.judul} className="w-[min(16.5rem,78%)] shrink-0 snap-start">
            <article className="flex h-full flex-col overflow-hidden rounded-kartu border border-garis bg-permukaan">
              <div className="kupon-kepala relative flex items-center gap-3 border-b border-dashed border-lapis-2 bg-biru-pudar px-4 py-3.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-biru text-white">
                  <Ikon nama={p.ikon} className="size-5" />
                </span>
                <h3 className="text-lead leading-tight font-bold">{p.judul}</h3>
              </div>
              <p className="flex-1 px-4 pt-4 text-kecil text-lembut">{p.isi}</p>
              {p.luar ? (
                <a href={p.href} target="_blank" rel="noreferrer" className={kelasAksi}>
                  {p.aksi}
                  <Ikon nama="luar" className="size-4" />
                  <span className="sr-only"> (tab baru)</span>
                </a>
              ) : (
                <Link href={p.href} className={kelasAksi}>
                  {p.aksi}
                  <Ikon nama="kanan" className="panah size-4" />
                </Link>
              )}
            </article>
          </li>
        ))}
      </BarisGeser>
    </section>
  );
}
