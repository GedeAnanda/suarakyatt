// components/prioritas/RiwayatBobot.tsx — riwayat keputusan bobot (FR-F4, PRD 7.5), pemilik: A
// Siapa, kapan, dari berapa ke berapa, dan alasannya. Tampil publik.

import type { RiwayatBobot as Riwayat } from '@/lib/data/prioritas';
import { tanggalJam } from '@/lib/format';
import { NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR } from '@/lib/scoring';
import Ikon from '../ui/Ikon';

const p = (x: number) => `${Math.round(x * 100)}%`;

export default function RiwayatBobot({ riwayat }: { riwayat: Riwayat[] }) {
  if (riwayat.length === 0) {
    return (
      <p className="kartu flex gap-3 p-5 text-badan text-lembut">
        <Ikon nama="info" className="mt-0.5 size-5 shrink-0 text-biru" />
        Belum ada perubahan bobot. Bobot yang berlaku masih bobot awal dari PRD; perubahan pertama oleh Perencana akan
        tercatat di sini beserta alasannya.
      </p>
    );
  }
  return (
    <ol className="grid gap-3">
      {riwayat.map((r) => {
        const berubah = FAKTOR.filter((f) => Math.abs((r.bobot_baru[f] ?? 0) - (r.bobot_lama[f] ?? 0)) >= 0.005);
        return (
          <li key={r.created_at} className="kartu grid gap-4 p-5 sm:grid-cols-[13rem_1fr] sm:gap-8">
            <div className="flex items-start gap-3 text-kecil">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
                <Ikon nama="geser" className="size-4.5" />
              </span>
              <div>
                <p className="font-bold">{tanggalJam(r.created_at)}</p>
                <p className="text-lembut">{r.pelaku}</p>
              </div>
            </div>
            <div>
              <p className="text-badan">&ldquo;{r.alasan}&rdquo;</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {berubah.map((f) => {
                  const naik = r.bobot_baru[f] > r.bobot_lama[f];
                  return (
                    <li key={f} className="flex items-center gap-1.5 rounded-[0.375rem] bg-latar px-2.5 py-1 text-kecil">
                      {NAMA_FAKTOR[f]}
                      <span className="angka text-lembut">{p(r.bobot_lama[f])}</span>
                      <Ikon nama={naik ? 'naik' : 'turun'} className={`size-3.5 ${naik ? 'text-hijau' : 'text-merah-tua'}`} />
                      <span className="angka font-bold">{p(r.bobot_baru[f])}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
