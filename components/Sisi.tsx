// components/Sisi.tsx — menu samping berikon (pemilik: A)
// Seperti menu kiri situs travel: kelompok halaman utama, lalu laporan, lalu halaman penjelas, lalu kanal
// pengaduan resmi. Layar lebar: deret ikon; tombol menu (TombolMenu) membuka panel lebar di atas halaman.
// Layar kecil: laci. Panel dan laci tertutup sendiri begitu halaman dipilih, saat Esc ditekan, atau saat
// pengguna mengklik di luarnya, supaya tidak menghalangi halaman yang dituju.
// usePathname/useSearchParams wajib di dalam <Suspense>; SisiNavStatis adalah fallback tanpa penanda aktif.

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { KANAL_RESMI } from '@/lib/konten';
import { laciBuka, layarLebar, pantauSisi, sisiTerbuka, tutupMenu } from '@/lib/sisi';
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
      { href: '/tentang', label: 'Tentang SUARAKYAT', ikon: 'info' },
      { href: '/rapor/cara-menilai', label: 'Cara menilai', ikon: 'buku' },
      { href: '/sumber-data', label: 'Sumber data', ikon: 'data' },
    ],
  },
];

/** Satu tautan aktif: href terpanjang yang cocok, jadi /rapor/cara-menilai tidak ikut menyalakan Rapor. */
function hrefAktif(pathname: string, lanjut: string | null): string | undefined {
  if (pathname.startsWith('/laporan/') || pathname === '/contoh') return '/lacak';
  // Tamu yang memilih Lapor masalah diarahkan proxy.ts ke /masuk?lanjut=/lapor: Lapor tetap tersorot.
  if (pathname === '/masuk' && lanjut?.startsWith('/lapor')) return '/lapor';
  return MENU.flatMap((g) => g.item)
    .filter((i) => (i.href === '/' ? pathname === '/' : pathname === i.href || pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function IsiSisi({ aktif }: { aktif?: string }) {
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
                    onClick={tutupMenu}
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
      <div className="tirai" aria-hidden="true" onClick={tutupMenu} />
    </>
  );
}

/** Tanpa penanda halaman aktif: fallback <Suspense> saat prerender. */
export function SisiNavStatis() {
  return <IsiSisi />;
}

export function SisiNav() {
  const pathname = usePathname();
  const lanjut = useSearchParams().get('lanjut');
  const laci = useSyncExternalStore(pantauSisi, () => !layarLebar() && laciBuka(), () => false);
  const panel = useSyncExternalStore(pantauSisi, () => layarLebar() && sisiTerbuka(), () => false);

  // Pindah halaman menutup laci dan panel.
  useEffect(() => tutupMenu(), [pathname]);

  // Laci terbuka: fokus ke tautan pertama.
  useEffect(() => {
    if (laci) document.querySelector<HTMLElement>('#sisi a')?.focus();
  }, [laci]);

  // Laci atau panel terbuka: Esc dan klik di luar menu menutupnya.
  useEffect(() => {
    if (!laci && !panel) return;
    const tombol = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      tutupMenu();
      document.getElementById('tombol-menu')?.focus();
    };
    const klik = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!t.closest('#sisi, #tombol-menu')) tutupMenu();
    };
    window.addEventListener('keydown', tombol);
    document.addEventListener('pointerdown', klik);
    return () => {
      window.removeEventListener('keydown', tombol);
      document.removeEventListener('pointerdown', klik);
    };
  }, [laci, panel]);

  return <IsiSisi aktif={hrefAktif(pathname, lanjut)} />;
}
