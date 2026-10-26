// components/ui/Ikon.tsx — ikon garis 24px yang dipakai ulang (pemilik: A)
// Ikon selalu pendamping teks, tidak pernah satu-satunya penanda (PRD 11).

import type { ReactNode } from 'react';

const JALUR: Record<string, ReactNode> = {
  cari: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  tutup: <path d="m5 5 14 14M19 5 5 19" />,
  lokasi: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  kamera: (
    <>
      <path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  jam: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  peringatan: (
    <>
      <path d="M12 3 2 20h20Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  dukung: <path d="M12 4 4 13h5v7h6v-7h5Z" />,
  naik: <path d="m6 15 6-6 6 6" />,
  turun: <path d="m6 9 6 6 6-6" />,
  kunci: (
    <>
      <rect x="5" y="11" width="14" height="10" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  bintang: <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" />,
  unggah: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  centang: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  tautan: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
    </>
  ),
  salin: (
    <>
      <rect x="8" y="8" width="12" height="12" />
      <path d="M16 8V4H4v12h4" />
    </>
  ),
  bagikan: (
    <>
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 13v8h14v-8" />
    </>
  ),
};

export type NamaIkon = keyof typeof JALUR;

export default function Ikon({
  nama,
  className = 'size-5',
  isi = false,
}: {
  nama: NamaIkon;
  className?: string;
  isi?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill={isi ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {JALUR[nama]}
    </svg>
  );
}
