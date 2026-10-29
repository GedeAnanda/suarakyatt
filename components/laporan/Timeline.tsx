// components/laporan/Timeline.tsx — riwayat status laporan (FR-D3), pemilik: A
// Setiap perubahan: status, siapa, kapan, catatan. Penolakan tampil lengkap dengan alasannya.

import { tanggalJam } from '@/lib/format';
import { LABEL_ALASAN } from '@/lib/konten';
import type { TimelineItem } from '@/lib/types';
import { GAYA_STATUS, IkonStatus, LABEL_STATUS } from '../BadgeStatus';

export default function Timeline({ item, berjalan = false }: { item: TimelineItem[]; berjalan?: boolean }) {
  return (
    <ol className="relative grid gap-0">
      {item.map((t, i) => {
        const terakhir = i === item.length - 1;
        return (
          <li key={`${t.status_baru}-${t.created_at}`} className="relative grid grid-cols-[2.25rem_1fr] gap-x-4 pb-6 last:pb-0">
            {!terakhir && <span aria-hidden="true" className="absolute top-9 bottom-0 left-[1.0625rem] w-0.5 rounded-full bg-lapis-2" />}
            {/* Status terakhir laporan yang masih berjalan memancarkan cincin: di sinilah laporannya sekarang. */}
            <span
              className={`relative flex size-9 items-center justify-center rounded-full ring-4 ring-permukaan ${GAYA_STATUS[t.status_baru]} ${
                terakhir && berjalan ? 'cincin' : ''
              }`}
            >
              <IkonStatus status={t.status_baru} className="size-[1.125rem]" />
            </span>
            <div className="pt-1">
              <p className="text-badan font-bold">
                {LABEL_STATUS[t.status_baru]}
                {t.alasan_tolak && <span className="font-normal"> · alasan: {LABEL_ALASAN[t.alasan_tolak]}</span>}
              </p>
              <p className="text-kecil text-lembut">
                {tanggalJam(t.created_at)} · {t.pelaku}
              </p>
              {t.catatan && <p className="mt-2 max-w-[60ch] rounded-kontrol bg-latar px-3 py-2 text-kecil">&ldquo;{t.catatan}&rdquo;</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
