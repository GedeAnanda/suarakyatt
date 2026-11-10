// components/laporan/RingkasanStatus.tsx — "Status sekarang" dalam satu kotak di atas peta (pemilik: A)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 1.1): jawaban "kenapa belum / kenapa ditolak" harus terbaca
// di layar pertama HP, tanpa menggulir melewati peta dan foto. Isinya:
// - batas waktu (IndikatorSLA) dan perkiraan selesai dari dinas;
// - kendala terakhir dari instansi (alasan tunda, migrasi 0010) bila status belum berubah sejak kendala dicatat;
// - alasan penolakan, termasuk tautan ke laporan asli untuk duplikat;
// - tautan lompat ke penjelasan lengkap (panel "Kenapa belum?", blok penolakan, riwayat).

import Link from 'next/link';
import IndikatorSLA, { hitungSLA } from '@/components/IndikatorSLA';
import { akhirHari, tanggal } from '@/lib/format';
import { LABEL_ALASAN, LABEL_TUNDA } from '@/lib/konten';
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
      <p className="text-mini font-semibold tracking-wide text-lembut uppercase">Status sekarang</p>
      {sla && <IndikatorSLA laporan={l} sekarang={sekarang} />}

      {kendala && (
        <div className="flex gap-2.5 rounded-kontrol border border-st-menunggu/25 bg-oranye-muda px-3 py-2.5 text-kecil">
          <Ikon nama="jam" className="mt-0.5 size-4 shrink-0 text-st-menunggu" />
          <p>
            <span className="font-bold">Kenapa tertunda: {LABEL_TUNDA[kendala.alasan_tunda!].toLowerCase()}.</span>
            {kendala.catatan && <> {kendala.catatan}</>}
            <span className="mt-0.5 block text-mini text-lembut">
              Dicatat instansi {tanggal(kendala.created_at)}
            </span>
          </p>
        </div>
      )}
      {aktif && !kendala && sla?.terlambat && l.status !== 'menunggu' && (
        <p className="flex gap-2.5 text-kecil">
          <Ikon nama="info" className="mt-0.5 size-4 shrink-0 text-lembut" />
          Instansi belum mencatat alasan keterlambatan. Posisi isunya di daftar prioritas ada di &ldquo;Kenapa belum?&rdquo;.
        </p>
      )}
      {aktif && l.status === 'menunggu' && (
        <p className="flex gap-2.5 text-kecil">
          <Ikon nama="info" className="mt-0.5 size-4 shrink-0 text-lembut" />
          Menunggu diperiksa instansi. Setelah diterima, jadwal dan kendalanya tercatat di sini.
        </p>
      )}

      {penolakan && (
        <p className="flex gap-2.5 text-kecil">
          <Ikon nama="peringatan" className="mt-0.5 size-4 shrink-0 text-merah-tua" />
          <span>
            <span className="font-bold">
              Ditolak karena {penolakan.alasan_tolak ? LABEL_ALASAN[penolakan.alasan_tolak].toLowerCase() : 'alasan yang tidak tercatat'}.
            </span>{' '}
            {penolakan.duplikat_dari_kode ? (
              <>
                Masalah yang sama sudah dilaporkan di{' '}
                <Link href={`/laporan/${penolakan.duplikat_dari_kode}`} className="font-kode font-bold text-biru-tua underline underline-offset-4">
                  {penolakan.duplikat_dari_kode}
                </Link>
                ; dukungan dipindah ke sana.
              </>
            ) : (
              'Laporan tetap tampil publik supaya keputusan ini bisa diperiksa.'
            )}
          </span>
        </p>
      )}

      {l.perkiraan_selesai && aktif && (
        <p className="text-kecil">
          Perkiraan selesai dari dinas: <strong className="font-bold">{tanggal(l.perkiraan_selesai)}</strong>
          {lewatJanji && (
            <span className="ml-2 rounded-[0.375rem] bg-merah-muda px-2 py-0.5 text-mini font-bold text-merah-tua">Melewati janji</span>
          )}
        </p>
      )}

      <nav aria-label="Lompat ke penjelasan" className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-garis pt-2.5">
        {lompat.map((t) => (
          <a key={t.href} href={t.href} className="inline-flex min-h-8 items-center gap-1 text-kecil font-semibold text-biru-tua hover:underline">
            {t.label}
            <Ikon nama="turun" className="size-3.5" />
          </a>
        ))}
      </nav>
    </div>
  );
}
