import Link from 'next/link';
import { kelasTombol } from '../ui/Tombol';

/** Garis prioritas membelah pertanyaan; satu salinan visual dengan dua bidang warna. */
export default function HeroGaris() {
  return (
    <section aria-labelledby="judul-beranda" className="hero-prioritas">
      <div className="bingkai hero-judul">
        <h1 id="judul-beranda" className="hero-kalimat" aria-label="Kenapa belum?">
          <span className="baris-naik"><span>KENAPA</span></span>
          <span className="baris-naik"><span>BELUM?</span></span>
        </h1>
      </div>
      <div className="di-medan bg-medan text-medan-tinta">
        <div className="bingkai hero-ajakan timbul">
          <p className="max-w-[42ch] text-lead">
            Kenali posisi masalah di wilayahmu. Coba ubah prioritas dan lihat siapa yang naik.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="#coba-prioritas" className={kelasTombol('medan', 'min-h-12')}>Coba ubah prioritas</Link>
            <Link href="/contoh" className="inline-flex min-h-11 items-center text-badan underline decoration-2 underline-offset-4 hover:decoration-transparent">Lacak satu contoh</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
