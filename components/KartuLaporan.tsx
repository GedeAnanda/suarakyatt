// components/KartuLaporan.tsx — ringkasan satu laporan untuk daftar (PRD 11), pemilik: A
// Kartu hasil seperti daftar hotel: kode dan status di atas, kategori sebagai judul, lokasi dan waktu,
// lalu batas waktu di kaki kartu. Foto (kalau ada) di kanan. Dipakai di Peta laporan.

import Image from 'next/image';
import Link from 'next/link';
import { lalu } from '@/lib/format';
import type { LaporanPublik } from '@/lib/types';
import BadgeStatus from './BadgeStatus';
import IndikatorSLA from './IndikatorSLA';
import Ikon from './ui/Ikon';
import IkonKategori from './ui/IkonKategori';

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
    <Link href={href} className="group kartu kartu-klik flex h-full flex-col gap-4 p-4">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-kode angka text-kecil font-bold tracking-wide text-biru-tua">{l.kode}</span>
            <BadgeStatus status={l.status} />
          </p>
          <div className="mt-3 flex items-center gap-3">
            <IkonKategori nama={l.kategori} />
            <div className="min-w-0">
              <p className="text-lead leading-snug font-bold group-hover:text-biru-tua">{l.kategori}</p>
              <p className="mt-0.5 flex items-center gap-1 text-kecil text-lembut">
                <Ikon nama="lokasi" className="size-3.5" />
                <span className="truncate">
                  {l.kecamatan}, {l.kota}
                </span>
              </p>
            </div>
          </div>
        </div>
        {l.foto && <Image src={l.foto} alt="" width={96} height={96} className="size-20 shrink-0 rounded-kontrol object-cover" />}
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-garis pt-3">
        <IndikatorSLA ringkas sekarang={sekarang} laporan={{ responded_at: null, resolved_at: null, ...l }} />
        <span className="angka flex items-center gap-3 text-mini text-lembut">
          <span>{lalu(l.created_at, sekarang)}</span>
          <span className="flex items-center gap-1" title="Dukungan warga">
            <Ikon nama="dukung" className="size-3.5" />
            {l.jumlah_upvote}
            <span className="sr-only">dukungan</span>
          </span>
          {l.jarak_m !== undefined && <span>{l.jarak_m} m dari titik Anda</span>}
        </span>
      </div>
    </Link>
  );
}
