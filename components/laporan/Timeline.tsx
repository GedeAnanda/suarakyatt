// components/laporan/Timeline.tsx — riwayat status laporan (FR-D3), pemilik: A
// Setiap perubahan: status, siapa, kapan, catatan. Penolakan tampil lengkap dengan alasannya; penolakan duplikat
// menautkan laporan aslinya. Baris kendala (alasan tunda, migrasi 0010) tidak mengubah status, jadi tampil sebagai
// "Kendala · <alasan>" dengan ikon jam, bukan sebagai status baru.

import Link from 'next/link';
import { tanggalJam } from '@/lib/format';
import { KARENA_ALASAN } from '@/lib/kamus';
import { LABEL_TUNDA } from '@/lib/konten';
import type { TimelineItem } from '@/lib/types';
import { GAYA_STATUS, IkonStatus, LABEL_STATUS } from '../BadgeStatus';
import Ikon from '../ui/Ikon';

/** "Admin · Dinas Tata Air (simulasi)" → "Dinas Tata Air"; catatan seed → "Dinas (data buatan)". */
export function namaPelaku(p: string): string {
  if (p === 'Catatan simulasi') return 'Dinas (data buatan)';
  return p.replace(/^Admin · /, '').replace(' (simulasi)', '');
}

export default function Timeline({ item, berjalan = false }: { item: TimelineItem[]; berjalan?: boolean }) {
  return (
    <ol className="relative grid gap-0">
      {item.map((t, i) => {
        const terakhir = i === item.length - 1;
        const kendala = t.alasan_tunda !== null && t.alasan_tunda !== undefined;
        return (
          <li
            key={`${t.status_baru}-${t.alasan_tunda ?? ''}-${t.created_at}`}
            className="relative grid grid-cols-[2.25rem_1fr] gap-x-4 pb-6 last:pb-0"
          >
            {!terakhir && <span aria-hidden="true" className="absolute top-9 bottom-0 left-[1.0625rem] w-0.5 rounded-full bg-lapis-2" />}
            {/* Status terakhir laporan yang masih berjalan memancarkan cincin: di sinilah laporannya sekarang. */}
            <span
              className={`relative flex size-9 items-center justify-center rounded-full ring-4 ring-permukaan ${
                kendala ? 'bg-oranye-muda text-st-menunggu' : GAYA_STATUS[t.status_baru]
              } ${terakhir && berjalan ? 'cincin' : ''}`}
            >
              {kendala ? <Ikon nama="jam" className="size-[1.125rem]" /> : <IkonStatus status={t.status_baru} className="size-[1.125rem]" />}
            </span>
            <div className="pt-1">
              <p className="text-badan font-bold">
                {kendala ? (
                  <>
                    Ada kendala<span className="font-normal">: {LABEL_TUNDA[t.alasan_tunda!].toLowerCase()}</span>
                  </>
                ) : (
                  LABEL_STATUS[t.status_baru]
                )}
                {t.alasan_tolak && <span className="font-normal">: {KARENA_ALASAN[t.alasan_tolak]}</span>}
              </p>
              <p className="text-kecil text-lembut">
                {tanggalJam(t.created_at)} · {namaPelaku(t.pelaku)}
                {kendala && ` · status tidak berubah, masih ${LABEL_STATUS[t.status_baru].toLowerCase()}`}
              </p>
              {t.catatan && <p className="mt-2 max-w-[60ch] rounded-kontrol bg-latar px-3 py-2 text-kecil">&ldquo;{t.catatan}&rdquo;</p>}
              {t.duplikat_dari_kode && (
                <p className="mt-2 text-kecil">
                  Laporan asli:{' '}
                  <Link href={`/laporan/${t.duplikat_dari_kode}`} className="font-kode font-bold text-biru-tua underline underline-offset-4">
                    {t.duplikat_dari_kode}
                  </Link>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
