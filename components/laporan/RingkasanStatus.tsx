// components/laporan/RingkasanStatus.tsx — "Status sekarang" dalam satu kotak di atas peta (pemilik: A)
// Revisi FDS 10 Nov (1.1) + audit bahasa awam 10 Nov (W7, W20–W23, W41): jawaban "kenapa belum / kenapa ditolak"
// terbaca di layar pertama HP, dalam bahasa warga (lib/kamus.ts). Isinya:
// - arti status sekarang dalam satu kalimat;
// - batas waktu (IndikatorSLA) dan perkiraan selesai dari dinas;
// - kendala terakhir dari dinas (alasan tunda) bila status belum berubah sejak dicatat;
// - alasan penolakan + apa yang bisa dilakukan, termasuk tautan ke laporan asli untuk duplikat;
// - tautan lompat ke penjelasan lengkap.

import Link from 'next/link';
import IndikatorSLA, { hitungSLA } from '@/components/IndikatorSLA';
import { akhirHari, tanggal } from '@/lib/format';
import { ARTI_ALASAN, ARTI_STATUS, ARTI_TUNDA, KARENA_ALASAN } from '@/lib/kamus';
import { LABEL_TUNDA } from '@/lib/konten';
import type { LaporanPublik, TimelineItem } from '@/lib/types';
import Ikon from '../ui/Ikon';

/** Kendala terakhir yang masih berlaku: dicatat pada status yang sama dengan status laporan sekarang. */
export function kendalaBerlaku(l: Pick<LaporanPublik, 'status'>, timeline: TimelineItem[]): TimelineItem | null {
  const terakhir = [...timeline].reverse().find((t) => t.alasan_tunda);
  return terakhir && terakhir.status_baru === l.status ? terakhir : null;
}

export default function RingkasanStatus({
  laporan: l,
  timeline,
  sekarang,
  aktif,
}: {
  laporan: LaporanPublik;
  timeline: TimelineItem[];
  sekarang: number;
  aktif: boolean;
}) {
  const sla = hitungSLA(l, sekarang);
  const kendala = aktif ? kendalaBerlaku(l, timeline) : null;
  const penolakan = l.status === 'ditolak' ? [...timeline].reverse().find((t) => t.status_baru === 'ditolak') : undefined;
  const lewatJanji = aktif && l.perkiraan_selesai !== null && sekarang > akhirHari(l.perkiraan_selesai);

  const lompat = [
    aktif && { href: '#kenapa-belum', label: 'Kenapa belum?' },
    penolakan && { href: '#judul-tolak', label: 'Alasan lengkap' },
    { href: '#judul-riwayat', label: 'Riwayat penanganan' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div id="status-sekarang" className="mt-4 grid scroll-mt-28 gap-3 rounded-kontrol bg-latar px-4 py-3.5">
      <div>
        <p className="text-mini font-semibold tracking-wide text-lembut uppercase">Status sekarang</p>
        <p className="mt-1 text-kecil">{ARTI_STATUS[l.status]}</p>
      </div>
      {sla && <IndikatorSLA laporan={l} sekarang={sekarang} />}

      {kendala && (
        <div className="flex gap-2.5 rounded-kontrol border border-st-menunggu/25 bg-oranye-muda px-3 py-2.5 text-kecil">
          <Ikon nama="jam" className="mt-0.5 size-4 shrink-0 text-st-menunggu" />
          <p>
            <span className="font-bold">Kenapa tertunda: {LABEL_TUNDA[kendala.alasan_tunda!].toLowerCase()}.</span>{' '}
            {kendala.catatan ?? ARTI_TUNDA[kendala.alasan_tunda!]}
            <span className="mt-0.5 block text-mini text-lembut">Ditulis dinas {tanggal(kendala.created_at)}</span>
          </p>
        </div>
      )}
      {aktif && !kendala && sla?.terlambat && l.status !== 'menunggu' && (
        <p className="flex gap-2.5 text-kecil">
          <Ikon nama="info" className="mt-0.5 size-4 shrink-0 text-lembut" />
          Dinas belum menulis alasan keterlambatannya. Buka &ldquo;Kenapa belum?&rdquo; untuk melihat seberapa didahulukan
          masalah ini.
        </p>
      )}
      {aktif && l.status === 'menunggu' && (
        <p className="flex gap-2.5 text-kecil">
          <Ikon nama="info" className="mt-0.5 size-4 shrink-0 text-lembut" />
          Setelah diperiksa, statusnya menjadi &ldquo;Sudah diperiksa&rdquo; dan jadwal atau kendalanya muncul di sini.
        </p>
      )}

      {penolakan && (
        <div className="flex gap-2.5 text-kecil">
          <Ikon nama="peringatan" className="mt-0.5 size-4 shrink-0 text-merah-tua" />
          <p>
            <span className="font-bold">
              Ditolak karena {penolakan.alasan_tolak ? KARENA_ALASAN[penolakan.alasan_tolak] : 'alasan yang tidak tercatat'}.
            </span>{' '}
            {penolakan.duplikat_dari_kode ? (
              <>
                Laporan yang sama ada di{' '}
                <Link href={`/laporan/${penolakan.duplikat_dari_kode}`} className="font-kode font-bold text-biru-tua underline underline-offset-4">
                  {penolakan.duplikat_dari_kode}
                </Link>
                . Dukungan laporan ini sudah dipindah ke sana; pantau perkembangannya di laporan itu.
              </>
            ) : (
              <>
                {penolakan.alasan_tolak && ARTI_ALASAN[penolakan.alasan_tolak]} Merasa keliru? Buat laporan baru dengan foto
                dan titik yang lebih jelas.
              </>
            )}
          </p>
        </div>
      )}

      {l.perkiraan_selesai && aktif && (
        <p className="text-kecil">
          Perkiraan selesai dari dinas: <strong className="font-bold">{tanggal(l.perkiraan_selesai)}</strong>
          {lewatJanji && (
            <span className="ml-2 rounded-[0.375rem] bg-merah-muda px-2 py-0.5 text-mini font-bold text-merah-tua">
              Sudah lewat dari perkiraan
            </span>
          )}
        </p>
      )}

      <nav aria-label="Lompat ke penjelasan" className="flex flex-wrap gap-x-4 gap-y-1 border-t border-garis pt-2">
        {lompat.map((t) => (
          <a key={t.href} href={t.href} className="inline-flex min-h-11 items-center gap-1 text-kecil font-semibold text-biru-tua hover:underline">
            {t.label}
            <Ikon nama="turun" className="size-3.5" />
          </a>
        ))}
      </nav>
    </div>
  );
}
