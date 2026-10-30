// components/BadgeStatus.tsx — status laporan sebagai titik warna + teks (SDD 9.1), pemilik: A
// Titiknya senada dengan titik di peta. Warna hanya pelengkap; status selalu terbaca dari teksnya.
// IkonStatus tetap dipakai untuk penanda riwayat (Timeline) dan halaman admin.

import { Ban, CheckCheck, CircleCheck, CircleX, Clock, RefreshCw, type LucideIcon } from 'lucide-react';
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

/** Warna titik di peta, senada dengan badge. */
export const WARNA_TITIK: Record<StatusLaporan, string> = {
  menunggu: '#d97706',
  diverifikasi: '#6366f1',
  diproses: '#06b6d4',
  selesai: '#22a04b',
  ditolak: '#0f2a33',
  dibatalkan: '#94a3b8',
};

/** Warna teks badge di latar putih (teks st-ditolak putih karena dibuat untuk latar navy). */
const TEKS_STATUS: Record<StatusLaporan, string> = {
  menunggu: 'text-st-menunggu',
  diverifikasi: 'text-st-diverifikasi',
  diproses: 'text-st-diproses',
  selesai: 'text-st-selesai',
  ditolak: 'text-teks',
  dibatalkan: 'text-st-dibatalkan',
};

/** Titik warna status, dipakai badge dan saringan status di peta. */
export function TitikStatus({ status, className = 'size-2' }: { status: StatusLaporan; className?: string }) {
  return <span aria-hidden="true" className={`shrink-0 rounded-full ${className}`} style={{ backgroundColor: WARNA_TITIK[status] }} />;
}

/** Ikon Lucide tiap status: jam, lingkaran centang, panah berputar, centang ganda, lingkaran silang, larangan. */
const IKON_STATUS: Record<StatusLaporan, LucideIcon> = {
  menunggu: Clock,
  diverifikasi: CircleCheck,
  diproses: RefreshCw,
  selesai: CheckCheck,
  ditolak: CircleX,
  dibatalkan: Ban,
};

export function IkonStatus({ status, className = 'size-4' }: { status: StatusLaporan; className?: string }) {
  const Komponen = IKON_STATUS[status];
  return <Komponen className={`shrink-0 ${className}`} strokeWidth={2.25} aria-hidden="true" />;
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
      className={`inline-flex items-center gap-1.5 font-semibold whitespace-nowrap ${besar ? 'text-kecil' : 'text-mini'} ${
        TEKS_STATUS[status]
      } ${className}`}
    >
      <TitikStatus status={status} className={besar ? 'size-2.5' : 'size-2'} />
      {LABEL_STATUS[status]}
    </span>
  );
}
