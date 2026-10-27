// components/NavUtama.tsx — tautan navigasi dengan penanda halaman aktif dan menu ponsel (pemilik: A)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Ikon from './ui/Ikon';

export const NAVIGASI = [
  { href: '/prioritas', label: 'Prioritas' },
  { href: '/rapor', label: 'Rapor instansi' },
  { href: '/peta', label: 'Peta laporan' },
  { href: '/sumber-data', label: 'Sumber data' },
];

function aktif(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Tanpa penanda halaman aktif: dipakai sebagai fallback <Suspense> saat prerender. */
export function TautanNavStatis() {
  return <TautanNavIsi pathname="" />;
}

export function TautanNav() {
  return <TautanNavIsi pathname={usePathname()} />;
}

function TautanNavIsi({ pathname }: { pathname: string }) {
  return (
    <ul className="hidden items-center gap-1 whitespace-nowrap xl:flex">
      {NAVIGASI.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={aktif(pathname, item.href) ? 'page' : undefined}
            className="block rounded-(--radius-kontrol) px-3 py-2 text-badan font-medium text-teks decoration-2 transition-colors aria-[current=page]:text-tinta underline-offset-[0.4em] hover:bg-lapis aria-[current=page]:underline"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Tombol menu sebelum JavaScript siap (fallback <Suspense>). */
export function MenuPonselStatis() {
  return (
    <div className="xl:hidden">
      <span className="flex h-11 items-center gap-2 rounded-(--radius-kontrol) bg-lapis px-3 text-kecil font-medium">
        <Ikon nama="menu" className="size-4" />
        <span className="hidden sm:inline">Menu</span>
      </span>
    </div>
  );
}

/** Menu layar kecil: panel penuh lebar di bawah bar, tertutup otomatis saat pindah halaman. */
export function MenuPonsel({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tombol = useRef<HTMLButtonElement>(null);
  const [buka, setBuka] = useState(false);
  const [halamanTerakhir, setHalamanTerakhir] = useState(pathname);
  if (pathname !== halamanTerakhir) {
    setHalamanTerakhir(pathname);
    setBuka(false);
  }

  useEffect(() => {
    if (!buka) return;
    const tutup = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setBuka(false); tombol.current?.focus(); }
    };
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [buka]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        ref={tombol}
        aria-label={buka ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={buka}
        aria-controls="menu-ponsel"
        onClick={() => setBuka((b) => !b)}
        className="flex h-11 items-center gap-2 rounded-(--radius-kontrol) bg-lapis px-3 text-kecil font-medium hover:bg-lapis-2"
      >
        <Ikon nama={buka ? 'tutup' : 'menu'} className="size-4" />
        <span className="hidden sm:inline">Menu</span>
      </button>
      <div
        id="menu-ponsel"
        hidden={!buka}
        className="menu-gerak absolute inset-x-0 top-full z-1000 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-kertas px-[var(--tepi)] pt-2 pb-8 shadow-[0_24px_40px_rgb(60_10_14/0.14)]"
      >
        <ul className="grid">
          {NAVIGASI.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktif(pathname, item.href) ? 'page' : undefined}
                className="block py-3 text-lead font-medium tracking-tight aria-[current=page]:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-4">{children}</div>
      </div>
    </div>
  );
}
