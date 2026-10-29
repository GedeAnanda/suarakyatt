// components/Sisi.tsx — menu samping berikon (pemilik: A)
// Seperti menu kiri situs travel: kelompok halaman utama, lalu laporan, lalu halaman penjelas, lalu kanal
// pengaduan resmi. Layar lebar: kolom tetap yang bisa diciutkan jadi deret ikon (TombolMenu).
// Layar kecil: laci yang tertutup sendiri saat pindah halaman, saat Esc ditekan, atau saat tirai diketuk.
// usePathname wajib di dalam <Suspense>; SisiNavStatis adalah fallback tanpa penanda halaman aktif.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { KANAL_RESMI } from '@/lib/konten';
import { aturLaci, laciBuka, layarLebar, pantauSisi } from '@/lib/sisi';
import Ikon, { type NamaIkon } from './ui/Ikon';

const MENU: { label: string; item: { href: string; label: string; ikon: NamaIkon }[] }[] = [
  {
    label: 'Jelajahi',
    item: [
      { href: '/', label: 'Beranda', ikon: 'rumah' },
      { href: '/prioritas', label: 'Dashboard prioritas', ikon: 'geser' },
      { href: '/rapor', label: 'Rapor instansi', ikon: 'lencana' },
      { href: '/peta', label: 'Peta laporan', ikon: 'peta' },
    ],
  },
  {
    label: 'Laporan',
    item: [
      { href: '/lapor', label: 'Lapor masalah', ikon: 'tambah' },
      { href: '/lacak', label: 'Lacak laporan', ikon: 'lacak' },
    ],
  },
  {
    label: 'Pelajari',
    item: [
      { href: '/rapor/cara-menilai', label: 'Cara menilai', ikon: 'buku' },
      { href: '/sumber-data', label: 'Sumber data', ikon: 'data' },
    ],
  },
];

/** Satu tautan aktif: href terpanjang yang cocok, jadi /rapor/cara-menilai tidak ikut menyalakan Rapor. */
function hrefAktif(pathname: string): string | undefined {
  if (pathname.startsWith('/laporan/') || pathname === '/contoh') return '/lacak';
  return MENU.flatMap((g) => g.item)
    .filter((i) => (i.href === '/' ? pathname === '/' : pathname === i.href || pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function IsiSisi({ pathname }: { pathname: string }) {
  const aktif = hrefAktif(pathname);
  return (
    <>
      <nav id="sisi" aria-label="Menu utama" className="sisi">
        <div className="flex min-h-full flex-col px-3 py-3 rel:px-2">
          {MENU.map((g, i) => (
            <ul key={g.label} aria-label={g.label} className={`grid gap-0.5 ${i > 0 ? 'mt-2 border-t border-garis pt-2' : ''}`}>
              {g.item.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={aktif === it.href ? 'page' : undefined}
                    title={it.label}
                    className={`flex h-11 items-center gap-3 rounded-kontrol px-3 text-badan transition-colors hover:bg-lapis aria-[current=page]:bg-biru-muda aria-[current=page]:text-biru-tua rel:justify-center rel:px-0 ${
                      i === 0 ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    <Ikon nama={it.ikon} className="size-5" />
                    <span className="truncate rel:sr-only">{it.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}

          <div className="mt-2 border-t border-garis pt-2">
            <p className="px-3 pt-1 pb-1 text-mini font-semibold text-lembut rel:sr-only">Pengaduan resmi</p>
            <ul aria-label="Kanal pengaduan resmi" className="grid gap-0.5">
              {KANAL_RESMI.map((k) => (
                <li key={k.nama}>
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noreferrer"
                    title={`${k.nama}, kanal resmi (tab baru)`}
                    className="flex h-10 items-center gap-3 rounded-kontrol px-3 text-kecil font-semibold text-lembut transition-colors hover:bg-lapis hover:text-teks rel:justify-center rel:px-0 rel:text-[0.6875rem]"
                  >
                    <Ikon nama="luar" className="size-4.5 rel:hidden" />
                    <span>
                      {k.nama}
                      <span className="sr-only"> (tab baru)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-auto px-3 pt-8 pb-1 text-mini text-lembut rel:hidden">
            Prototipe untuk lomba WIA MIA 2026. Sebagian besar data adalah data simulasi.
          </p>
        </div>
      </nav>
      <div className="tirai" aria-hidden="true" onClick={() => aturLaci(false)} />
    </>
  );
}

/** Tanpa penanda halaman aktif: fallback <Suspense> saat prerender. */
export function SisiNavStatis() {
  return <IsiSisi pathname="" />;
}

export function SisiNav() {
  const pathname = usePathname();
  const laci = useSyncExternalStore(pantauSisi, () => !layarLebar() && laciBuka(), () => false);

  // Pindah halaman menutup laci.
  useEffect(() => aturLaci(false), [pathname]);

  // Laci terbuka: fokus ke tautan pertama; Esc menutup laci dan mengembalikan fokus ke tombol menu.
  useEffect(() => {
    if (!laci) return;
    document.querySelector<HTMLElement>('#sisi a')?.focus();
    const tombol = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      aturLaci(false);
      document.getElementById('tombol-menu')?.focus();
    };
    window.addEventListener('keydown', tombol);
    return () => window.removeEventListener('keydown', tombol);
  }, [laci]);

  return <IsiSisi pathname={pathname} />;
}
