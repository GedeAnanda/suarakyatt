// components/beranda/KuponPeran.tsx — siapa memakai apa, sebagai deret kupon (pemilik: A)
// Kartu pertama adalah ajakan mencoba akun demo (seperti kartu "masuk dan ambil kupon" di situs travel);
// sisanya satu kupon per peran: warga, perencana, pengawas, dan pengingat bahwa ini bukan kanal resmi.

import Link from 'next/link';
import TombolDemo from '../TombolDemo';
import BarisGeser from '../ui/BarisGeser';
import Ikon, { type NamaIkon } from '../ui/Ikon';

const PERAN: { judul: string; ikon: NamaIkon; isi: string; href: string; aksi: string }[] = [
  {
    judul: 'Warga',
    ikon: 'warga',
    isi: 'Lihat posisi isu wilayahmu di antara semua isu yang dinilai, faktor yang mendorong dan menahannya, lalu lacak laporanmu dengan kode SR.',
    href: '/prioritas',
    aksi: 'Lihat dashboard prioritas',
  },
  {
    judul: 'Perencana',
    ikon: 'geser',
    isi: 'Bobot enam faktor diatur Perencana. Setiap perubahan wajib beralasan dan tercatat publik: siapa, kapan, dari berapa ke berapa.',
    href: '/prioritas#judul-riwayat',
    aksi: 'Buka riwayat keputusan',
  },
  {
    judul: 'Pengawas',
    ikon: 'mata',
    isi: 'Jurnalis, DPRD, dan komunitas membaca Rapor Instansi A sampai E, selalu bersama tingkat penolakan, sampel, dan periodenya.',
    href: '/rapor',
    aksi: 'Baca rapor instansi',
  },
  {
    judul: 'Bukan kanal resmi',
    ikon: 'info',
    isi: 'Laporan di sini tidak diteruskan ke instansi. Wilayah studinya DKI Jakarta daratan: lima kota administrasi, 42 kecamatan.',
    href: '/sumber-data',
    aksi: 'Lihat sumber data',
  },
];

export default function KuponPeran() {
  return (
    <section aria-labelledby="judul-peran" className="bingkai mt-12 sm:mt-14">
      <h2 id="judul-peran" className="judul-seksi">
        Lapis kedua yang belum terbuka
      </h2>
      <p className="mt-2 max-w-[78ch] text-badan text-lembut">
        Warga Jakarta sudah bisa melapor dan melacak laporannya. Yang belum terbuka adalah lapis kedua: kenapa satu jalan
        diperbaiki lebih dulu, dinas mana yang lambat, dan apa yang berubah kalau prioritas diganti.{' '}
        <Link href="/tentang#beda" className="font-semibold text-biru-tua hover:underline">
          Lihat bedanya dengan kanal resmi
        </Link>
      </p>

      {/* Tanpa kelas `muncul`: di laptop 900 px deret ini sudah mengintip di layar pertama, jadi akan terlihat pudar
          sebelum digulir (termasuk di tangkapan layar Beranda). */}
      <BarisGeser label="Untuk siapa SUARAKYAT" className="mt-5">
        {/* Lebar dibatasi persen deret supaya di ponsel 320 px kartu tidak lebih lebar dari layar. */}
        <li className="w-[min(20rem,88%)] shrink-0 snap-start sm:w-[22rem]">
          <div className="di-gelap flex h-full flex-col rounded-kartu bg-[linear-gradient(135deg,#0f766e_0%,#115e59_55%,#134e4a_100%)] p-5 text-white">
            <p className="flex items-center gap-2 text-lead font-bold">
              <Ikon nama="kunci" className="size-5" />
              Coba tanpa daftar
            </p>
            <p className="mt-2 text-kecil text-white/90">
              Akun demo bersama untuk juri dan pengunjung. Warga demo bisa melapor dan mendukung laporan; admin demo
              mengubah status laporan Dinas Bina Jalan (simulasi). Data demo dikembalikan ke awal setiap malam.
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
              <Link
                href={p.href}
                className="m-4 inline-flex items-center gap-1 self-start text-kecil font-bold text-biru-tua hover:underline"
              >
                {p.aksi}
                <Ikon nama="kanan" className="panah size-4" />
              </Link>
            </article>
          </li>
        ))}
      </BarisGeser>
    </section>
  );
}
