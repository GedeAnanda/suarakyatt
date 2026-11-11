// components/Footer.tsx — penutup: kolom tautan, aplikasi pengaduan resmi, sumber terbuka, atribusi (pemilik: A)
// Atribusi "© OpenStreetMap contributors" wajib tampil (SDD bagian 2, lisensi ODbL).

import Link from 'next/link';
import { FOTO, KANAL_RESMI } from '@/lib/konten';
import TombolHuruf from './TombolHuruf';
import Ikon from './ui/Ikon';
import Wordmark from './Wordmark';

const KOLOM = [
  {
    judul: 'Prioritas dan rapor',
    tautan: [
      { href: '/prioritas', label: 'Urutan prioritas' },
      { href: '/prioritas#cara-hitung', label: 'Cara urutan dihitung' },
      { href: '/kecamatan', label: 'Skor kecamatan' },
      { href: '/rapor', label: 'Rapor dinas' },
      { href: '/rapor/cara-menilai', label: 'Cara rapor dihitung' },
    ],
  },
  {
    judul: 'Laporan',
    tautan: [
      { href: '/peta', label: 'Peta laporan' },
      { href: '/lapor', label: 'Lapor masalah' },
      { href: '/lacak', label: 'Lacak laporan' },
    ],
  },
  {
    judul: 'Pelajari',
    tautan: [
      { href: '/tentang', label: 'Tentang dan tanya jawab' },
      { href: '/sumber-data', label: 'Sumber data dan lisensi' },
      { href: '/sumber-data#simulasi', label: 'Cara data buatan dibuat' },
      { href: '/sumber-data#foto', label: 'Kredit foto' },
    ],
  },
];

const TERBUKA = [
  { nama: 'OpenStreetMap', url: 'https://www.openstreetmap.org/copyright' },
  { nama: 'HDX · BPS', url: 'https://data.humdata.org/dataset/cod-ab-idn' },
  { nama: 'Wikimedia Commons', url: 'https://commons.wikimedia.org' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-garis bg-permukaan pb-[calc(env(safe-area-inset-bottom)+4rem)] sm:pb-[env(safe-area-inset-bottom)]">
      <div className="bingkai grid gap-10 py-10 sm:grid-cols-3 sm:py-12 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.6fr)]">
        {KOLOM.map((k) => (
          <div key={k.judul}>
            <h2 className="text-badan font-bold">{k.judul}</h2>
            <ul className="mt-2 grid gap-1">
              {k.tautan.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="inline-flex min-h-8 items-center text-kecil text-lembut transition-colors hover:text-biru-tua hover:underline"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="sm:col-span-3 lg:col-span-1">
          <h2 className="text-badan font-bold">Aplikasi pengaduan resmi Pemprov DKI Jakarta</h2>
          <p className="mt-1 text-kecil text-lembut">
            Laporan di SUARAKYAT tidak dikirim ke dinas. Agar ditangani pemerintah, lapor lewat salah satu aplikasi ini.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {KANAL_RESMI.map((k) => (
              <li key={k.nama}>
                <a
                  href={k.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-kontrol border border-garis px-4 text-badan font-bold transition-colors hover:border-biru hover:text-biru-tua"
                >
                  {k.nama}
                  <Ikon nama="luar" className="size-4 text-lembut" />
                  <span className="sr-only">(tab baru)</span>
                </a>
              </li>
            ))}
          </ul>
          <h2 className="mt-7 text-badan font-bold">Data terbuka yang dipakai</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TERBUKA.map((t) => (
              <li key={t.nama}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-8 items-center rounded-full bg-lapis px-3 text-kecil font-semibold text-lembut transition-colors hover:bg-biru-muda hover:text-biru-tua"
                >
                  {t.nama}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-garis">
        <div className="bingkai grid gap-2 py-6 text-mini text-lembut sm:text-kecil">
          <p>
            Peta dasar ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
              OpenStreetMap contributors
            </a>
            . Batas kecamatan: HDX COD-AB Indonesia (BPS), CC BY-IGO. Foto dunia nyata dari Wikimedia Commons dan Flickr:{' '}
            {Object.values(FOTO)
              .map((f) => `${f.pembuat} (${f.lisensi})`)
              .join(', ')}
            .
          </p>
          <div className="mb-2">
            <TombolHuruf />
          </div>
          <p className="text-kecil">
            Situs ini dibuat untuk lomba Web in Action 2026. Laporan, dinas, dan nilai rapor adalah data buatan; peta dan
            batas kecamatan memakai data asli.
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Wordmark className="text-lead text-teks" />
            <span className="text-kecil">
              Aplikasi pengaduan resmi sudah bisa melacak laporan. SUARAKYAT menunjukkan alasan di balik urutan perbaikan.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
