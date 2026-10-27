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
      <p className="kartu p-5 text-badan">
        Belum ada perubahan bobot acuan yang disimpan. Bobot yang berlaku masih bobot awal model; perubahan pertama oleh Perencana akan
        tercatat di sini beserta alasannya. Percobaan preset pengunjung tidak mengubah bobot acuan.
      </p>
    );
  }
  return (
    <ol className="grid gap-4">
      {riwayat.map((r) => {
        const berubah = FAKTOR.filter((f) => Math.abs((r.bobot_baru[f] ?? 0) - (r.bobot_lama[f] ?? 0)) >= 0.005);
        return (
          <li key={r.created_at} className="kartu grid gap-4 p-5 sm:grid-cols-[14rem_1fr] sm:gap-8 sm:p-6">
            <div className="text-kecil">
              <p className="font-medium">{tanggalJam(r.created_at)}</p>
              <p className="text-lembut">{r.pelaku}</p>
            </div>
            <div>
              <p className="text-badan">&ldquo;{r.alasan}&rdquo;</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {berubah.map((f) => {
                  const naik = r.bobot_baru[f] > r.bobot_lama[f];
                  return (
                    <li key={f} className="flex items-center gap-1.5 rounded-full bg-lapis px-3 py-1 text-kecil">
                      {NAMA_FAKTOR[f]}
                      <span className="angka text-lembut">{p(r.bobot_lama[f])}</span>
                      <Ikon nama={naik ? 'naik' : 'turun'} className="size-3.5" />
                      <span className="angka font-semibold">{p(r.bobot_baru[f])}</span>
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
