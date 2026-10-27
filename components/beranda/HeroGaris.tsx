// components/beranda/HeroGaris.tsx — layar pertama Beranda (pemilik: A)
// Dua medan bertemu di garis tengah: garis prioritas. Di atasnya masalah yang didahulukan,
// di bawahnya yang masih menunggu. Pertanyaan "Kenapa belum?" terpotong tepat di garis itu.
// Saat Beranda dibuka, hurufnya dirakit satu per satu (TeksRakit) sementara medan merah naik dari
// bawah ke garis tengah; huruf yang melintasi garis berganti warna. Saat digulir, medan terus naik.

import Link from 'next/link';
import TeksRakit from '../ui/TeksRakit';
import { kelasTombol } from '../ui/Tombol';

// Tiap baris 625 × 125 px pada layar 1440 px (lebar tinta × tinggi huruf kapital), sebanding di layar lain.
// Author: tinggi kapital 0,594em, jadi font-size = (125 / 1440) / 0,594 = 14,62vw. Lebar tinta tiap baris
// pada ukuran itu diregangkan ke 43,4vw (625 px) dengan scaleX.
const BARIS = [
  { teks: 'KENAPA', regang: 0.9495 },
  { teks: 'BELUM?', regang: 0.9976 },
];
// Urutan huruf pertama tiap baris: baris kedua melanjutkan urutan baris pertama.
const AWAL = BARIS.map((_, i) => BARIS.slice(0, i).reduce((n, b) => n + b.teks.length, 0));

function Judul({ salinan = false }: { salinan?: boolean }) {
  return (
    <p
      aria-hidden={salinan || undefined}
      className="hero-angkat absolute inset-x-0 text-center text-[14.62vw] leading-[0.86] font-semibold tracking-[-0.045em]"
      // Garis tengah memotong baris kedua di tengahnya: puncak teks = 50% − 1,5 × tinggi baris.
      style={{ top: 'calc(50% - 1.29em)' }}
    >
      {BARIS.map((baris, i) => (
        <span key={baris.teks} className="block">
          <span className="inline-block" style={{ transform: `scaleX(${baris.regang})` }}>
            <TeksRakit teks={baris.teks} urutAwal={AWAL[i]} sebar={0.9} jeda={i ? 120 : 0} />
          </span>
        </span>
      ))}
    </p>
  );
}

export default function HeroGaris() {
  return (
    <section
      aria-labelledby="judul-beranda"
      className="hero-garis relative h-[82svh] max-h-[64rem] min-h-[32rem] overflow-hidden sm:h-[calc(100svh-4.5rem)] sm:min-h-[34rem]"
    >
      <h1 id="judul-beranda" className="sr-only">
        Kenapa belum? suaRAkyat membuka alasan di balik urutan penanganan masalah kota.
      </h1>
      {/* Garis prioritas (--garis, globals.css): naik dari bawah saat dibuka, lalu terus naik saat hero digulir pergi. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-(--garis) bottom-0 bg-medan" />

      {/* Salinan atas: tinta di atas kertas. Salinan bawah: kertas di atas medan merah. */}
      <div aria-hidden="true" className="absolute inset-0 text-tinta [clip-path:inset(0_0_calc(100%_-_var(--garis))_0)]">
        <Judul />
      </div>
      <div aria-hidden="true" className="bayang-judul absolute inset-0 text-medan-tinta [clip-path:inset(var(--garis)_0_0_0)]">
        <Judul salinan />
      </div>

      {/* Kalimat pendukung menunggu medan merah sampai di bawahnya, supaya teks terang tidak tampil di atas kertas. */}
      <div className="di-medan timbul absolute inset-x-0 bottom-0 text-medan-tinta" style={{ animationDelay: '950ms' }}>
        <div className="bingkai flex flex-col gap-6 pb-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-[46ch] text-badan sm:text-lead">
            Kanal pengaduan sudah melacak status laporan. suaRAkyat membuka alasan di balik urutannya: kenapa satu masalah
            di Jakarta didahulukan, dan bagaimana urutan itu berubah kalau bobotnya diganti.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/prioritas" className={kelasTombol('medan', 'min-h-12')}>
              Uji bobot prioritas
            </Link>
            <Link href="/peta" className="py-2 text-badan underline decoration-2 underline-offset-4 hover:decoration-transparent">
              Lihat peta laporan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
