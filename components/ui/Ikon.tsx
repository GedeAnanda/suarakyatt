// components/ui/Ikon.tsx — ikon garis 24px yang dipakai ulang (pemilik: A)
// Garis membulat setebal 1,8 seperti ikon menu situs travel. Ikon selalu pendamping teks,
// tidak pernah satu-satunya penanda (PRD 11); teksnya boleh disembunyikan visual (sr-only).

import type { ReactNode } from 'react';

const JALUR: Record<string, ReactNode> = {
  cari: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  tutup: <path d="m6 6 12 12M18 6 6 18" />,
  rumah: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9v11h13V9" />
      <path d="M10 20v-5.5h4V20" />
    </>
  ),
  geser: (
    <>
      <path d="M4 6.5h9.5M18.5 6.5H20M4 12h3.5M12.5 12H20M4 17.5h11.5" />
      <circle cx="16" cy="6.5" r="2.25" />
      <circle cx="10" cy="12" r="2.25" />
      <circle cx="18" cy="17.5" r="2.25" />
    </>
  ),
  lencana: (
    <>
      <circle cx="12" cy="9" r="5.75" />
      <path d="m8.6 13.6-1.6 7 5-2.6 5 2.6-1.6-7" />
    </>
  ),
  peta: (
    <>
      <path d="M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8Z" />
      <path d="M9 4.5v12.7M15 6.8v12.7" />
    </>
  ),
  tambah: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  lacak: (
    <>
      <path d="M11.5 20.5H5.5v-17h8l4 4V10" />
      <path d="M13.5 3.5v4h4" />
      <circle cx="16" cy="15.5" r="3" />
      <path d="m18.2 17.7 2.3 2.3" />
    </>
  ),
  buku: (
    <>
      <path d="M3.5 5.5c2.6-1 5.4-.8 8.5 1 3.1-1.8 5.9-2 8.5-1v13c-2.6-1-5.4-.8-8.5 1-3.1-1.8-5.9-2-8.5-1Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="5.75" rx="7.25" ry="2.5" />
      <path d="M4.75 5.75v12.5c0 1.4 3.25 2.5 7.25 2.5s7.25-1.1 7.25-2.5V5.75" />
      <path d="M4.75 12c0 1.4 3.25 2.5 7.25 2.5s7.25-1.1 7.25-2.5" />
    </>
  ),
  koper: (
    <>
      <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
      <path d="M9 7V4.5h6V7M3.5 12.5h17" />
    </>
  ),
  keluar: (
    <>
      <path d="M10 4.5H5v15h5" />
      <path d="m14.5 8 4 4-4 4M18.5 12H9.5" />
    </>
  ),
  kanan: <path d="m9.5 6 6 6-6 6" />,
  kiri: <path d="m14.5 6-6 6 6 6" />,
  luar: (
    <>
      <path d="M14 4.5h5.5V10M19.5 4.5 11 13" />
      <path d="M17.5 14v5.5h-13v-13H10" />
    </>
  ),
  atas: <path d="M12 19V5.5M6 11l6-6 6 6" />,
  jeda: <path d="M9 6v12M15 6v12" />,
  putar: <path d="M8 5.5v13l10.5-6.5Z" />,
  bantuan: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.8h.01" />
    </>
  ),
  gedung: (
    <>
      <path d="M5 20.5v-16l7-1.5v17.5M12 8.5h7v12M3 20.5h18" />
      <path d="M8.5 8h.01M8.5 12h.01M8.5 16h.01M15.5 12h.01M15.5 16h.01" />
    </>
  ),
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
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  peringatan: (
    <>
      <path d="M10.3 4.2 2.8 17.5a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  dukung: <path d="M12 4 4.5 12.5H9V20h6v-7.5h4.5Z" />,
  naik: <path d="m6 15 6-6 6 6" />,
  turun: <path d="m6 9 6 6 6-6" />,
  kunci: (
    <>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  bintang: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />,
  unggah: <path d="M12 16V4.5M7 9.5l5-5 5 5M4.5 19.5h15" />,
  centang: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  warga: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  grafik: <path d="M5 20V11M10 20V5M15 20v-7M20 20v-4M3 20h18" />,
  mata: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  perisai: (
    <>
      <path d="M12 3 4.5 6v6c0 4.6 3.2 7.9 7.5 9 4.3-1.1 7.5-4.4 7.5-9V6Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  tautan: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
    </>
  ),
  salin: (
    <>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" />
      <path d="M15.5 8.5V5.5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3" />
    </>
  ),
  bagikan: (
    <>
      <path d="M12 3.5v11.5M7.5 8 12 3.5 16.5 8" />
      <path d="M5.5 12.5v7h13v-7" />
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
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {JALUR[nama]}
    </svg>
  );
}
