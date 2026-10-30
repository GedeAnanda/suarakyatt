// components/beranda/SpandukGeser.tsx — deret spanduk foto di bawah spanduk besar (pemilik: A)
// Seperti carousel promo di beranda situs travel: beberapa spanduk sejajar, panah di kiri-kanan, titik di bawah.
// Tiap spanduk adalah pintu ke fitur yang sudah ada. Tidak bergeser sendiri, jadi tidak perlu tombol jeda.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useRef, useSyncExternalStore } from 'react';
import { FOTO, type FotoTerbuka } from '@/lib/konten';
import Ikon from '../ui/Ikon';

const SPANDUK: { href: string; judul: string; isi: string; foto: FotoTerbuka; posisi?: string }[] = [
  {
    href: '/peta?status=ditolak',
    judul: 'Penolakan tidak disembunyikan',
    isi: 'Laporan yang ditolak tetap tampil di peta, lengkap dengan alasannya.',
    foto: FOTO.trotoar,
  },
  {
    href: '/rapor',
    judul: 'Rapor instansi A sampai E',
    isi: 'Huruf selalu tampil bersama tingkat penolakan instansinya.',
    foto: FOTO.lampuJalan,
    posisi: '50% 30%',
  },
  {
    href: '/prioritas',
    judul: 'Uji bobotnya sendiri',
    isi: 'Geser enam faktor dan lihat urutan isu wilayah bergeser.',
    foto: FOTO.kanalTimur,
    posisi: '50% 60%',
  },
  {
    href: '/lacak',
    judul: 'Punya kode SR?',
    isi: 'Lacak status, riwayat, dan batas waktu laporanmu.',
    foto: FOTO.jalan1975,
  },
];

export default function SpandukGeser({ className = '' }: { className?: string }) {
  const jalur = useRef<HTMLUListElement>(null);

  const pantau = useCallback((ubah: () => void) => {
    const el = jalur.current;
    if (!el) return () => {};
    el.addEventListener('scroll', ubah, { passive: true });
    const ukuran = new ResizeObserver(ubah);
    ukuran.observe(el);
    return () => {
      el.removeEventListener('scroll', ubah);
      ukuran.disconnect();
    };
  }, []);
  // "awal|akhir|indeks": masih bisa digeser ke kiri/kanan, dan spanduk paling kiri yang terlihat.
  const posisi = useSyncExternalStore(
    pantau,
    () => {
      const el = jalur.current;
      if (!el) return '0|1|0';
      const lebar = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
      const indeks = Math.round(el.scrollLeft / (lebar + 16));
      return `${el.scrollLeft > 4 ? 1 : 0}|${el.scrollLeft + el.clientWidth < el.scrollWidth - 4 ? 1 : 0}|${indeks}`;
    },
    () => '0|1|0',
  );
  const [kiri, kanan, indeks] = posisi.split('|').map(Number);

  function ke(i: number) {
    const el = jalur.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const halus = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: halus ? 'smooth' : 'auto' });
  }

  const kelasPanah =
    'absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 text-white transition-colors hover:bg-navy/85';

  return (
    <div className={className}>
      <div className="relative">
        <ul ref={jalur} aria-label="Sorotan fitur" className="tanpa-batang flex snap-x snap-mandatory gap-4 overflow-x-auto">
          {SPANDUK.map((s) => (
            <li key={s.href} className="w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
              <Link href={s.href} className="group di-gelap relative block aspect-[16/9] overflow-hidden rounded-kartu bg-navy text-white">
                <Image
                  src={s.foto.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25rem, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-keluar group-hover:scale-105"
                  style={{ objectPosition: s.posisi ?? '50% 50%' }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(0deg,rgb(15_41_77/0.88)_0%,rgb(15_41_77/0.35)_55%,rgb(15_41_77/0.1)_100%)]"
                />
                <span className="absolute inset-x-0 bottom-0 grid gap-1 p-4">
                  <span className="flex items-center gap-1 text-lead font-bold">
                    {s.judul}
                    <Ikon nama="kanan" className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-kecil text-white/90">{s.isi}</span>
                  <span className="mt-1 text-[0.6875rem] text-white/70">
                    Foto: {s.foto.pembuat}, {s.foto.lisensi}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {kiri === 1 && (
          <button type="button" onClick={() => ke(Math.max(0, indeks - 1))} aria-label="Spanduk sebelumnya" className={`${kelasPanah} left-3`}>
            <Ikon nama="kiri" className="size-5" />
          </button>
        )}
        {kanan === 1 && (
          <button type="button" onClick={() => ke(Math.min(SPANDUK.length - 1, indeks + 1))} aria-label="Spanduk berikutnya" className={`${kelasPanah} right-3`}>
            <Ikon nama="kanan" className="size-5" />
          </button>
        )}
      </div>
      {/* Titiknya kecil, tapi area klik tiap tombol minimal 24×24 px (WCAG 2.5.8). */}
      <div className="mt-3 flex justify-center" role="group" aria-label="Pilih spanduk">
        {SPANDUK.map((s, i) => (
          <button
            key={s.href}
            type="button"
            onClick={() => ke(i)}
            aria-label={`Spanduk ${i + 1}: ${s.judul}`}
            aria-current={i === indeks || undefined}
            className="flex h-6 min-w-6 items-center justify-center px-1"
          >
            <span className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === indeks ? 'w-6 bg-biru' : 'w-1.5 bg-lapis-2'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
