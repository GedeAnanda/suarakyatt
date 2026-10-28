// components/BadgeStatus.tsx — status laporan sebagai teks + ikon (SDD 9.1), pemilik: A
// Warna hanya pelengkap; status selalu terbaca dari teks dan bentuk ikonnya.

import type { ReactNode } from 'react';
import type { StatusLaporan } from '@/lib/types';

export const LABEL_STATUS: Record<StatusLaporan, string> = {
  menunggu: 'Menunggu',
  diverifikasi: 'Diverifikasi',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
  dibatalkan: 'Dibatalkan',
};

export const GAYA_STATUS: Record<StatusLaporan, string> = {
  menunggu: 'bg-st-menunggu-bg text-st-menunggu',
  diverifikasi: 'bg-st-diverifikasi-bg text-st-diverifikasi',
  diproses: 'bg-st-diproses-bg text-st-diproses',
  selesai: 'bg-st-selesai-bg text-st-selesai',
  ditolak: 'bg-st-ditolak-bg text-st-ditolak',
  dibatalkan: 'bg-st-dibatalkan-bg text-st-dibatalkan',
};

/** Warna titik di peta, sama dengan teks badge. */
export const WARNA_TITIK: Record<StatusLaporan, string> = {
  menunggu: '#9a6a00',
  diverifikasi: '#12476b',
  diproses: '#0e4d4b',
  selesai: '#22521e',
  ditolak: '#3b3536',
  dibatalkan: '#4d4848',
};

export const IKON_STATUS: Record<StatusLaporan, ReactNode> = {
  // jam
  menunggu: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  // lingkaran centang
  diverifikasi: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  // panah berputar
  diproses: (
    <>
      <path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4" />
    </>
  ),
  // centang ganda
  selesai: (
    <>
      <path d="m2 13 4 4L16 7" />
      <path d="m10 15 2 2 10-10" />
    </>
  ),
  // lingkaran silang
  ditolak: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  // tanda larangan
  dibatalkan: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.6 5.6 12.8 12.8" />
    </>
  ),
};

export function IkonStatus({ status, className = 'size-4' }: { status: StatusLaporan; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {IKON_STATUS[status]}
    </svg>
  );
}

export default function BadgeStatus({
  status,
  besar = false,
  className = '',
}: {
  status: StatusLaporan;
  besar?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${
        besar ? 'px-3.5 py-1.5 text-badan' : 'px-2.5 py-0.5 text-kecil'
      } ${GAYA_STATUS[status]} ${className}`}
    >
      <IkonStatus status={status} className={besar ? 'size-5' : 'size-3.5'} />
      {LABEL_STATUS[status]}
    </span>
  );
}
