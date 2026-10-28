// components/beranda/HeroGaris.tsx — layar pertama Beranda (pemilik: A)
// Dua medan bertemu di garis tengah: garis prioritas. Di atasnya masalah yang didahulukan,
// di bawahnya yang masih menunggu. Pertanyaan "Kenapa belum?" terpotong tepat di garis itu.
// Saat Beranda dibuka, hurufnya dirakit satu per satu (TeksRakit) sementara medan merah naik dari
// bawah ke garis tengah; huruf yang melintasi garis berganti warna. Saat digulir, medan terus naik.

import Link from 'next/link';
import TeksRakit from '../ui/TeksRakit';
import { kelasTombol } from '../ui/Tombol';

// Judul selebar hero dikurangi tepi kiri-kanan (--tepi), di semua perangkat; ukurannya (--judul) dihitung
// di globals.css (.hero-isi) dan dibatasi tinggi hero supaya dua baris tetap muat di layar lanskap.
// Angka dari tinta huruf Author 600 (diukur lewat canvas, dalam em): tinta KENAPA 3,1265em lebarnya dan
// bergeser 0,0487em ke kanan dari kotaknya (sisi kiri K + letter-spacing negatif di huruf terakhir);
// tinta BELUM? lebih sempit, jadi diregangkan 1,0636× (dicek dari piksel screenshot) agar sama lebar, lalu
// digeser 0,0315em. Hasilnya tinta kedua baris tepat di tengah dengan tepi kiri dan kanan yang sama.
const BARIS = [
  { teks: 'KENAPA', regang: 1, geser: -0.0487 },
  { teks: 'BELUM?', regang: 1.0636, geser: -0.0315 },
];
// Urutan huruf pertama tiap baris: baris kedua melanjutkan urutan baris pertama.
const AWAL = BARIS.map((_, i) => BARIS.slice(0, i).reduce((n, b) => n + b.teks.length, 0));

function Judul({ salinan = false }: { salinan?: boolean }) {
  return (
    <p
      aria-hidden={salinan || undefined}
      className="judul-garis absolute inset-x-0 text-center leading-[0.76] font-semibold tracking-[-0.045em]"
      // Dua baris di tengah hero: puncak teks = 50% − satu tinggi baris, dinaikkan 0,02em karena tinta kapital
      // Author duduk sedikit di bawah tengah kotak barisnya. Garis merah memotong tinta baris kedua di tengahnya.
      style={{ top: 'calc(50% - 0.78em)' }}
    >
      {BARIS.map((baris, i) => (
        <span key={baris.teks} className="block">
          <span className="inline-block" style={{ transform: `translateX(${baris.geser}em) scaleX(${baris.regang})` }}>
            <TeksRakit teks={baris.teks} urutAwal={AWAL[i]} sebar={0.9} jeda={i ? 120 : 0} />
          </span>
        </span>
      ))}
    </p>
  );
}

// Layar pertama menjawab dan mengajak: judul, kalimat pendukung, dan tombol terlihat tanpa digulir.
// Layar lebar dan layar pendek: hero + pita merah setinggi layar dikurangi header (sm:h-18 / pendek:h-14);
// hero mengisi sisa tinggi setelah pita, dan ukuran judul (cqh) menyesuaikan sendiri.
// Ponsel dan tablet tegak: tinggi hero mengikuti lebar judul (sekitar 0,41 × lebar layar ditambah ruang),
// bukan setinggi layar, supaya dua kata tidak dikelilingi medan kosong dan bagian berikutnya ikut mengintip.
export default function HeroGaris() {
  return (
    <div className="flex flex-col lg:h-[calc(100svh-4.5rem)] lg:min-h-144 pendek:h-[calc(100svh-3.5rem)] pendek:min-h-0">
      <section
        aria-labelledby="judul-beranda"
        className="hero-garis relative h-[calc(44vw+8rem)] overflow-hidden [container-type:size] lg:h-auto lg:min-h-64 lg:flex-1 pendek:h-auto pendek:min-h-48 pendek:flex-1"
      >
        <h1 id="judul-beranda" className="sr-only">
          Kenapa belum? suaRAkyat membuka alasan di balik urutan penanganan masalah kota.
        </h1>
        {/* Lapisan isi: ukuran judul dan posisi garis dihitung dari ukuran hero (unit cqw/cqh, globals.css). */}
        <div aria-hidden="true" className="hero-isi absolute inset-0">
          {/* Garis prioritas (--garis): naik dari bawah saat dibuka, lalu terus naik saat hero digulir pergi. */}
          <div className="absolute inset-x-0 top-(--garis) bottom-0 bg-medan" />

          {/* Salinan atas: tinta di atas kertas. Salinan bawah: kertas di atas medan merah. */}
          <div className="absolute inset-0 text-tinta [clip-path:inset(0_0_calc(100%_-_var(--garis))_0)]">
            <Judul />
          </div>
          <div className="absolute inset-0 text-medan-tinta [clip-path:inset(var(--garis)_0_0_0)]">
            <Judul salinan />
          </div>
        </div>
      </section>

      <div className="di-medan shrink-0 bg-medan text-medan-tinta">
        <div className="bingkai flex flex-col gap-6 pt-4 pb-10 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:pb-10 pendek:flex-row pendek:items-end pendek:justify-between pendek:pb-6">
          <p className="max-w-[46ch] text-badan sm:text-lead pendek:text-badan">
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
    </div>
  );
}
