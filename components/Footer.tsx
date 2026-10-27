// components/Footer.tsx — penutup: nama, tautan, sumber, atribusi peta dan foto (pemilik: A)
// Atribusi "© OpenStreetMap contributors" wajib tampil (SDD bagian 2, lisensi ODbL).

import Link from 'next/link';
import { FOTO, KANAL_RESMI } from '@/lib/konten';
import Wordmark from './Wordmark';

const KOLOM = [
  {
    judul: 'Keputusan',
    tautan: [
      { href: '/prioritas', label: 'Dashboard prioritas' },
      { href: '/rapor', label: 'Rapor instansi' },
      { href: '/rapor/cara-menilai', label: 'Cara menilai' },
    ],
  },
  {
    judul: 'Laporan',
    tautan: [
      { href: '/peta', label: 'Peta laporan' },
      { href: '/lapor', label: 'Lapor masalah' },
      { href: '/lacak', label: 'Lacak dengan kode' },
    ],
  },
  {
    judul: 'Data',
    tautan: [
      { href: '/sumber-data', label: 'Sumber data dan lisensi' },
      { href: '/sumber-data#simulasi', label: 'Skenario simulasi' },
      { href: '/sumber-data#foto', label: 'Kredit foto' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="di-medan mt-auto overflow-hidden bg-medan text-medan-tinta">
      <div className="bingkai pt-16 sm:pt-24">
        <p className="text-lead text-medan-lembut sm:max-w-[34ch]">
          Kanal pengaduan sudah melacak laporan. suaRAkyat membuka alasan di balik keputusan.
        </p>

        <div className="mt-14 grid gap-12 sm:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-badan text-medan-lembut">Untuk pengaduan resmi ke Pemprov DKI Jakarta:</p>
            <ul className="mt-3 grid gap-1">
              {KANAL_RESMI.map((k) => (
                <li key={k.nama}>
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-judul font-medium tracking-tight decoration-2 underline-offset-[0.12em] transition-[translate] duration-300 ease-(--ease-keluar) hover:underline motion-safe:hover:translate-x-2"
                  >
                    {k.nama}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {KOLOM.map((k) => (
              <div key={k.judul}>
                <p className="text-kecil text-medan-lembut">{k.judul}</p>
                <ul className="mt-3 grid gap-2">
                  {k.tautan.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className="inline-block py-1 text-badan decoration-2 underline-offset-4 transition-[translate] duration-200 hover:underline motion-safe:hover:translate-x-1"
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid max-w-[75ch] gap-2 text-kecil text-medan-lembut sm:mt-24">
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
          <p>
            Sebagian besar data di aplikasi ini adalah data simulasi untuk lomba Web in Action (WIA) MIA 2026 dan diberi
            label di setiap halaman.
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="mt-10 -mb-[0.16em] overflow-hidden text-center text-[19.5vw] leading-[0.8] select-none">
        <div className="kaki-nama">
          <Wordmark />
        </div>
      </div>
    </footer>
  );
}
