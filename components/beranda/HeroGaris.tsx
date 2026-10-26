// components/beranda/HeroGaris.tsx — layar pertama Beranda (pemilik: A)
// Dua medan bertemu di garis tengah: garis prioritas. Di atasnya masalah yang didahulukan,
// di bawahnya yang masih menunggu. Pertanyaan "Kenapa belum?" terpotong tepat di garis itu.

import Link from 'next/link';
import { kelasTombol } from '../ui/Tombol';

// Tiap baris 625 × 125 px pada layar 1440px (lebar tinta × tinggi huruf kapital), sebanding di layar lain.
// Author: tinggi kapital 0,594em, jadi font-size = (125 / 1440) / 0,594 = 14,62vw. Lebar tinta pada ukuran itu
// "KENAPA" 45,7vw dan "BELUM?" 43,5vw, lalu diregangkan ke 43,4vw (625px) dengan scaleX.
const BARIS = [
  { teks: 'KENAPA', regang: 0.9495 },
  { teks: 'BELUM?', regang: 0.9976 },
];

function Judul({ salinan = false }: { salinan?: boolean }) {
  return (
    <p
      aria-hidden={salinan || undefined}
      className="hero-angkat absolute inset-x-0 text-center text-[14.62vw] leading-[0.86] font-semibold tracking-[-0.045em]"
      // Garis tengah memotong baris kedua di tengahnya: puncak teks = 50% − 1,5 × tinggi baris.
      style={{ top: 'calc(50% - 1.29em)' }}
    >
      {BARIS.map((baris) => (
        <span key={baris.teks} className="baris-naik block overflow-hidden">
          {/* span tengah dipakai animasi baris-naik (transform), jadi regangan ada di span terdalam. */}
          <span>
            <span className="inline-block" style={{ transform: `scaleX(${baris.regang})` }}>
              {baris.teks}
            </span>
          </span>
        </span>
      ))}
    </p>
  );
}

export default function HeroGaris() {
  return (
    <section aria-labelledby="judul-beranda" className="hero-garis relative h-[calc(100svh-4rem)] min-h-[34rem] overflow-hidden sm:h-[calc(100svh-4.5rem)]">
      <h1 id="judul-beranda" className="sr-only">
        Kenapa belum? suaRAkyat membuka alasan di balik urutan penanganan masalah kota.
      </h1>
      {/* Garis prioritas (--garis, globals.css): naik dari bawah saat dibuka, lalu terus naik saat hero digulir pergi. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-(--garis) bg-medan" />

      {/* Salinan atas: tinta di atas kertas. Salinan bawah: kertas di atas medan merah. */}
      <div aria-hidden="true" className="absolute inset-0 text-tinta [clip-path:inset(0_0_calc(100%_-_var(--garis))_0)]">
        <Judul />
      </div>
      <div aria-hidden="true" className="bayang-judul absolute inset-0 text-medan-tinta [clip-path:inset(var(--garis)_0_0_0)]">
        <Judul salinan />
      </div>

      <div className="di-medan timbul absolute inset-x-0 bottom-0 text-medan-tinta">
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
