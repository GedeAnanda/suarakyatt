// components/KartuLaporan.tsx — ringkasan satu laporan untuk daftar (PRD 11), pemilik: A
// Dipakai di Peta, daftar admin, dan laporan serupa di form lapor.

import Image from 'next/image';
import Link from 'next/link';
import { lalu } from '@/lib/format';
import type { LaporanPublik } from '@/lib/types';
import BadgeStatus from './BadgeStatus';
import IndikatorSLA from './IndikatorSLA';
import Ikon from './ui/Ikon';

export type RingkasLaporan = Pick<
  LaporanPublik,
  'kode' | 'kategori' | 'status' | 'kecamatan' | 'kota' | 'created_at' | 'jumlah_upvote' | 'batas_respons' | 'batas_selesai'
> &
  Partial<Pick<LaporanPublik, 'responded_at' | 'resolved_at'>> & { foto?: string | null; jarak_m?: number };

export default function KartuLaporan({
  laporan: l,
  sekarang,
  href = `/laporan/${l.kode}`,
}: {
  laporan: RingkasLaporan;
  sekarang: number;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 bg-lapis p-4 transition-colors hover:bg-lapis-2 sm:p-5"
    >
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="angka text-badan font-semibold tracking-tight group-hover:underline">{l.kode}</span>
          <BadgeStatus status={l.status} />
        </p>
        <p className="mt-1.5 text-badan font-medium">{l.kategori}</p>
        <p className="text-kecil text-lembut">
          {l.kecamatan}, {l.kota} · {lalu(l.created_at, sekarang)}
          {l.jarak_m !== undefined && ` · ${l.jarak_m} m dari titik Anda`}
        </p>
      </div>
      {l.foto ? (
        <Image src={l.foto} alt="" width={96} height={96} className="size-20 object-cover sm:size-24" />
      ) : (
        <span className="angka flex items-center gap-1 self-start text-kecil text-lembut" title="Dukungan warga">
          <Ikon nama="dukung" className="size-3.5" />
          {l.jumlah_upvote}
        </span>
      )}
      <div className="col-span-2">
        <IndikatorSLA
          ringkas
          sekarang={sekarang}
          laporan={{ responded_at: null, resolved_at: null, ...l }}
        />
      </div>
    </Link>
  );
}
