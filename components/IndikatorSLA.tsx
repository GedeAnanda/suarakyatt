// components/IndikatorSLA.tsx — "Sisa 18 jam" atau "Terlambat 2 hari" (PRD 11), pemilik: A
// Bahasa awam di layar; istilah SLA hanya di keterangan.

import { durasi } from '@/lib/format';
import type { LaporanPublik } from '@/lib/types';
import Ikon from './ui/Ikon';

type Masukan = Pick<LaporanPublik, 'status' | 'batas_respons' | 'batas_selesai' | 'responded_at' | 'resolved_at'>;

export interface HasilSLA {
  teks: string;
  keterangan: string;
  terlambat: boolean;
  selesai: boolean;
}

export function hitungSLA(l: Masukan, sekarang: number): HasilSLA | null {
  if (l.status === 'dibatalkan' || l.status === 'ditolak') return null;
  const batasSelesai = Date.parse(l.batas_selesai);

  if (l.status === 'selesai' && l.resolved_at) {
    const lewat = Date.parse(l.resolved_at) - batasSelesai;
    return lewat > 0
      ? { teks: `Selesai terlambat ${durasi(lewat)}`, keterangan: 'melewati batas waktu selesai', terlambat: true, selesai: true }
      : { teks: 'Selesai tepat waktu', keterangan: 'dalam batas waktu selesai', terlambat: false, selesai: true };
  }

  // Menunggu: yang dihitung batas respons. Setelah direspons: batas selesai.
  const menunggu = l.status === 'menunggu';
  const batas = menunggu ? Date.parse(l.batas_respons) : batasSelesai;
  const jenis = menunggu ? 'batas waktu respons' : 'batas waktu selesai';
  const sisa = batas - sekarang;
  return sisa >= 0
    ? { teks: `Sisa ${durasi(sisa)}`, keterangan: `menuju ${jenis}`, terlambat: false, selesai: false }
    : { teks: `Terlambat ${durasi(sisa)}`, keterangan: `melewati ${jenis}`, terlambat: true, selesai: false };
}

export default function IndikatorSLA({
  laporan,
  sekarang,
  ringkas = false,
}: {
  laporan: Masukan;
  sekarang: number;
  ringkas?: boolean;
}) {
  const sla = hitungSLA(laporan, sekarang);
  if (!sla) return null;
  return (
    <span
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-1"
      title="Batas waktu layanan (SLA) per kategori. Angkanya ilustrasi dan tercantum di halaman Sumber Data."
    >
      <span
        className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap ${
          sla.terlambat ? 'rounded-full bg-tinta px-2.5 py-0.5 text-white' : 'text-teks'
        } ${ringkas ? 'text-kecil' : 'text-badan'}`}
      >
        <Ikon nama={sla.terlambat ? 'peringatan' : 'jam'} className={ringkas ? 'size-3.5' : 'size-4'} />
        {sla.teks}
      </span>
      {!ringkas && <span className="text-kecil text-lembut">{sla.keterangan}</span>}
    </span>
  );
}
