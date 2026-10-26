// components/beranda/HeroGaris.tsx — layar pertama Beranda (pemilik: A)
// Dua medan bertemu di garis tengah: garis prioritas. Di atasnya masalah yang didahulukan,
// di bawahnya yang masih menunggu. Pertanyaan "Kenapa belum?" terpotong tepat di garis itu.

import Link from 'next/link';
import { kelasTombol } from '../ui/Tombol';

const BARIS = ['KENAPA', 'BELUM?'];

function Judul({ salinan = false }: { salinan?: boolean }) {
  return (
    <p
      aria-hidden={salinan || undefined}
      className="absolute inset-x-0 text-center text-[19vw] leading-[0.86] font-semibold tracking-[-0.045em] sm:text-[clamp(4.5rem,15.5vw,15rem)]"
      // Garis tengah memotong baris kedua di tengahnya: puncak teks = 50% − 1,5 × tinggi baris.
      style={{ top: 'calc(50% - 1.29em)' }}
    >
      {BARIS.map((baris) => (
        <span key={baris} className="baris-naik block overflow-hidden">
          <span>{baris}</span>
        </span>
      ))}
    </p>
  );
}

export default function HeroGaris() {
  return (
    <section aria-labelledby="judul-beranda" className="relative h-[calc(100svh-4rem)] min-h-[34rem] overflow-hidden sm:h-[calc(100svh-4.5rem)]">
      <h1 id="judul-beranda" className="sr-only">
        Kenapa belum? suaRAkyat membuka alasan di balik urutan penanganan masalah kota.
      </h1>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-medan" />

      {/* Salinan atas: tinta di atas kertas. Salinan bawah: kertas di atas medan merah. */}
      <div aria-hidden="true" className="absolute inset-0 text-tinta [clip-path:inset(0_0_50%_0)]">
        <Judul />
      </div>
      <div aria-hidden="true" className="absolute inset-0 text-medan-tinta [clip-path:inset(50%_0_0_0)]">
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
