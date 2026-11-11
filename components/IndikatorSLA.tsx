// components/IndikatorSLA.tsx — "Sisa 18 jam untuk ditanggapi" atau "Belum selesai, lewat 2 hari" (PRD 11), pemilik: A
// Bahasa awam (audit 10 Nov, W6/W15): yang ditunggu selalu disebut (ditanggapi / selesai), tanpa istilah SLA/respons.
// Laporan warga ASLI (bukan simulasi) yang masih Menunggu tidak ditandai terlambat: SUARAKYAT tidak terhubung ke dinas
// sungguhan, jadi tidak ada yang memeriksanya (audit alur C1).

import { durasi } from '@/lib/format';
import type { LaporanPublik } from '@/lib/types';
import Ikon from './ui/Ikon';

type Masukan = Pick<LaporanPublik, 'status' | 'batas_respons' | 'batas_selesai' | 'responded_at' | 'resolved_at'> &
  Partial<Pick<LaporanPublik, 'is_simulated'>>;

export interface HasilSLA {
  teks: string;
  keterangan: string;
  terlambat: boolean;
  selesai: boolean;
}

export function hitungSLA(l: Masukan, sekarang: number): HasilSLA | null {
  if (l.status === 'dibatalkan' || l.status === 'ditolak') return null;
  const batasSelesai = Date.parse(l.batas_selesai);

  if (l.status === 'selesai') {
    // Tanpa waktu selesai (data tidak lengkap) jangan menebak terlambat atau tidak.
    if (!l.resolved_at) return { teks: 'Selesai', keterangan: '', terlambat: false, selesai: true };
    const lewat = Date.parse(l.resolved_at) - batasSelesai;
    return lewat > 0
      ? { teks: `Selesai, telat ${durasi(lewat)}`, keterangan: 'dari batas waktu selesai', terlambat: true, selesai: true }
      : { teks: 'Selesai tepat waktu', keterangan: 'sebelum batas waktu selesai', terlambat: false, selesai: true };
  }

  const menunggu = l.status === 'menunggu';
  if (menunggu && l.is_simulated === false) {
    return {
      teks: 'Belum ditanggapi',
      keterangan: 'SUARAKYAT tidak terhubung ke dinas sungguhan, jadi laporan asli bisa tetap Menunggu.',
      terlambat: false,
      selesai: false,
    };
  }

  // Menunggu: yang ditunggu tanggapan dinas (diperiksa atau ditolak). Sesudahnya: selesai.
  const batas = menunggu ? Date.parse(l.batas_respons) : batasSelesai;
  const sisa = batas - sekarang;
  if (sisa >= 0) {
    return menunggu
      ? { teks: `Sisa ${durasi(sisa)} untuk ditanggapi`, keterangan: 'menuju batas waktu ditanggapi', terlambat: false, selesai: false }
      : { teks: `Sisa ${durasi(sisa)} untuk selesai`, keterangan: 'menuju batas waktu selesai', terlambat: false, selesai: false };
  }
  return menunggu
    ? { teks: `Belum ditanggapi, lewat ${durasi(sisa)}`, keterangan: 'dari batas waktu ditanggapi', terlambat: true, selesai: false }
    : { teks: `Belum selesai, lewat ${durasi(sisa)}`, keterangan: 'dari batas waktu selesai', terlambat: true, selesai: false };
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
      className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1"
    >
      <span
        className={`inline-flex max-w-full items-center gap-1.5 font-medium ${
          sla.terlambat ? 'rounded-[0.375rem] bg-merah-muda px-2 py-0.5 text-merah-tua' : sla.selesai ? 'text-hijau' : 'text-teks'
        } text-kecil`}
      >
        <Ikon nama={sla.terlambat ? 'peringatan' : sla.selesai ? 'centang' : 'jam'} className={ringkas ? 'size-3.5' : 'size-4'} />
        <span>{sla.teks}</span>
      </span>
      {!ringkas && sla.keterangan && <span className="text-kecil text-lembut">{sla.keterangan}</span>}
    </span>
  );
}
