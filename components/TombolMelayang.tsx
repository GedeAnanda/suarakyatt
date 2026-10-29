// components/TombolMelayang.tsx — tombol bulat di pojok kanan bawah (pemilik: A)
// Seperti situs travel: "kembali ke atas" (muncul setelah digulir lebih dari satu layar, inert saat tersembunyi)
// di atas tombol bantuan. Bantuan membuka panel popover bawaan browser: cara menilai, sumber data,
// lacak laporan, dan kanal pengaduan resmi. Esc atau klik di luar menutupnya.

'use client';

import Link from 'next/link';
import { useRef, useSyncExternalStore } from 'react';
import { KANAL_RESMI } from '@/lib/konten';
import Ikon, { type NamaIkon } from './ui/Ikon';

function pantauGulir(ubah: () => void) {
  window.addEventListener('scroll', ubah, { passive: true });
  window.addEventListener('resize', ubah);
  return () => {
    window.removeEventListener('scroll', ubah);
    window.removeEventListener('resize', ubah);
  };
}

const BANTUAN: { href: string; label: string; ikon: NamaIkon }[] = [
  { href: '/rapor/cara-menilai', label: 'Cara menilai instansi', ikon: 'buku' },
  { href: '/sumber-data', label: 'Sumber data dan lisensi', ikon: 'data' },
  { href: '/lacak', label: 'Lacak laporan dengan kode', ikon: 'lacak' },
];

const kelasBulat =
  'flex size-11 items-center justify-center rounded-full border border-garis bg-permukaan text-teks shadow-angkat transition-[opacity,translate,color] duration-200 hover:text-biru-tua';

export default function TombolMelayang() {
  const tampil = useSyncExternalStore(pantauGulir, () => window.scrollY > window.innerHeight, () => false);
  const panel = useRef<HTMLDivElement>(null);
  const tutup = () => panel.current?.hidePopover();

  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-900 flex flex-col items-center gap-2 sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-6">
      <button
        type="button"
        inert={!tampil}
        aria-label="Kembali ke atas"
        onClick={() =>
          window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
        }
        className={`${kelasBulat} ${tampil ? '' : 'pointer-events-none translate-y-3 opacity-0'}`}
      >
        <Ikon nama="atas" className="size-5" />
      </button>
      <button type="button" popoverTarget="panel-bantuan" aria-label="Bantuan" title="Bantuan" className={kelasBulat}>
        <Ikon nama="bantuan" className="size-5" />
      </button>

      <div
        ref={panel}
        id="panel-bantuan"
        popover="auto"
        aria-label="Bantuan"
        className="fixed inset-auto right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.5rem)] m-0 w-[min(18rem,calc(100vw-2rem))] rounded-kartu border border-garis bg-permukaan p-4 text-teks shadow-angkat sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[4.75rem]"
      >
        <p className="text-badan font-bold">Butuh bantuan?</p>
        <ul className="mt-2 grid gap-0.5">
          {BANTUAN.map((b) => (
            <li key={b.href}>
              <Link href={b.href} onClick={tutup} className="flex h-10 items-center gap-2.5 rounded-kontrol px-2 text-kecil font-semibold hover:bg-lapis hover:text-biru-tua">
                <Ikon nama={b.ikon} className="size-4.5 text-biru" />
                {b.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-garis pt-3 text-mini text-lembut">Pengaduan resmi ke Pemprov DKI Jakarta:</p>
        <ul className="mt-2 flex gap-2">
          {KANAL_RESMI.map((k) => (
            <li key={k.nama}>
              <a
                href={k.url}
                target="_blank"
                rel="noreferrer"
                onClick={tutup}
                className="flex h-9 items-center gap-1.5 rounded-kontrol border border-garis px-3 text-kecil font-bold hover:border-biru hover:text-biru-tua"
              >
                {k.nama}
                <Ikon nama="luar" className="size-3.5 text-lembut" />
                <span className="sr-only">(tab baru)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
